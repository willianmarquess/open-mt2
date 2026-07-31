import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { EntityStateEnum } from '@/core/enum/EntityStateEnum';
import {
    HORSE_MAX_LEVEL,
    HORSE_STATS,
    getHorseGrade,
    getHorseVnumByLevel,
} from '@/core/domain/entities/game/horse/HorseStats';
import MathUtil from '@/core/domain/util/MathUtil';
import type NPC from '../../mob/NPC';
import type Logger from '@/core/infra/logger/Logger';

/** Minimal surface of Player that PlayerHorse needs to call back into. */
export interface IHorseOwner {
    logger: Logger;
    chat(opts: { messageType: ChatMessageTypeEnum; message: string }): void;
    isEventTimerActive(id: string): boolean;
    addEventTimer(opts: {
        id: string;
        eventFunction: () => void;
        options: { interval: number; duration?: number };
    }): void;
    removeEventTimer(id: string): void;
    /** Broadcast updated mountId to self + nearby players. */
    broadcastMountChange(): void;
    /** Whether the player currently has a private shop open. */
    isRunningPrivateShop(): boolean;
    /**
     * Flag an alive NPC as this player's horse corpse: others render it lying
     * dead, the owner keeps it alive client-side (clickable, stun marker).
     */
    showHorseCorpse(entity: NPC): void;
    /** Get player's current position X. */
    getPositionX(): number;
    /** Get player's current position Y. */
    getPositionY(): number;
    /** Get the player's current movement destination. */
    getTargetPosition(): { x: number; y: number };
    /** Get player's name. */
    getName(): string;
    /** Get player's area for spawning entities. */
    getArea(): any; // Area type
    /** Recalculate player combat points after mounting or dismounting. */
    recalculatePoints(): void;
    /** Send the complete points packet (includes POINT_HORSE_SKILL) plus the skill array. */
    sendPoints(): void;
    /** Save character stats. */
    save(): void;
}

const STAMINA_CONSUME_INTERVAL_MS = 6 * 60 * 1_000; // 6 min per tick
const STAMINA_REGEN_INTERVAL_MS = 12 * 60 * 1_000; // 12 min per tick
const HORSE_FOLLOW_INTERVAL_MS = 500;
const HORSE_FOLLOW_DISTANCE = 400;
const HORSE_FOLLOW_MIN_APPROACH = 150;
const HORSE_FOLLOW_MAX_APPROACH = 300;
const HORSE_FOLLOW_TIMER = 'HORSE_FOLLOW';
// Original behaviour (char_horse.cpp horse_dead_event): a dead horse lies on
// the ground for 60 seconds and then despawns automatically.
const HORSE_DEAD_DESPAWN_TIMER = 'HORSE_DEAD_DESPAWN';
const HORSE_DEAD_DESPAWN_MS = 60 * 1_000;

const TEMPORARY_HORSE_RIDE = 'TEMPORARY_HORSE_RIDE';
const HORSE_STAMINA_REGEN = 'HORSE_STAMINA_REGEN';
const HORSE_STAMINA_CONSUME = 'HORSE_STAMINA_CONSUME';
// Mounting and dismounting swap the horse entity for the rider model, and the
// client fades removed actors out over ~0.7s instead of deleting them at once
// (InstanceBaseEffect UpdateDeleting). Toggling faster than that stacks fading
// ghosts next to the new horse, so mount changes are rate limited like the
// original server does (issue #46).
const HORSE_MOUNT_COOLDOWN_MS = 1_000;

export class PlayerHorse {
    private level: number = 0;
    private health: number = 0;
    private stamina: number = 0;
    private riding: boolean = false;
    private temporaryRiding: boolean = false;
    private mountVnum: number = 0;
    private spawnedHorse: NPC | null = null; // Spawned horse entity when not riding
    private lastMountChangeAt: number = 0;
    private horseName: string = '';
    /** Player was riding at logout; restored once on enter-game (original: EnterHorse). */
    private pendingRemount: boolean = false;

    private readonly owner: IHorseOwner;

    constructor(owner: IHorseOwner) {
        this.owner = owner;
    }

    initialize(level: number, health: number, stamina: number, name: string, riding: boolean = false): void {
        this.level = Math.max(0, Math.min(Number(level) || 0, HORSE_MAX_LEVEL));
        const stat = HORSE_STATS[this.level];
        const parsedHealth = Number(health);
        const parsedStamina = Number(stamina);
        this.health = Math.max(
            0,
            Math.min(Number.isFinite(parsedHealth) ? parsedHealth : stat.maxHealth, stat.maxHealth),
        );
        this.stamina = Math.max(
            0,
            Math.min(Number.isFinite(parsedStamina) ? parsedStamina : stat.maxStamina, stat.maxStamina),
        );
        this.horseName = name || '';
        this.pendingRemount = riding;

        this.owner.recalculatePoints();
    }

    /**
     * Remount the horse after entering the game if the player was riding at
     * logout (original behaviour: CHorseRider::EnterHorse). Must run after the
     * player is spawned so the mount change reaches nearby players.
     */
    restoreRidingState(): void {
        if (!this.pendingRemount) return;
        this.pendingRemount = false;
        this.startRiding();
    }

    // ── Accessors ──────────────────────────────────────────────────────────────

    getSpawnedHorse(): NPC | null {
        return this.spawnedHorse;
    }

    despawn(): void {
        this.despawnHorseEntity();
    }

    getName(): string {
        return this.horseName;
    }

    setName(name: string): number {
        if (name.length < 2 || name.length > 12) {
            return 0;
        }
        if (name === this.horseName) {
            return 1;
        }
        this.horseName = name;
        if (this.spawnedHorse) {
            (this.spawnedHorse as any).name = name;
        }
        this.owner.save();
        return 2;
    }

    getLevel(): number {
        return this.level;
    }

    getHealth(): number {
        return this.health;
    }

    getMaxHealth(): number {
        return this.level > 0 ? HORSE_STATS[this.level].maxHealth : 1;
    }

    getStamina(): number {
        return this.stamina;
    }

    getMaxStamina(): number {
        return this.level > 0 ? HORSE_STATS[this.level].maxStamina : 1;
    }

    getGrade(): number {
        return getHorseGrade(this.level);
    }

    getMountVnum(): number {
        return this.mountVnum;
    }

    getStats() {
        return this.level > 0 ? HORSE_STATS[this.level] : HORSE_STATS[0];
    }

    isRiding(): boolean {
        return this.riding;
    }

    isTemporaryRiding(): boolean {
        return this.temporaryRiding;
    }

    summon(): boolean {
        if (this.level <= 0 || this.riding || this.spawnedHorse) return false;

        this.spawnHorseEntity();
        return this.spawnedHorse !== null;
    }

    // ── Mutations ──────────────────────────────────────────────────────────────

    setLevel(level: number): void {
        this.level = Math.max(0, Math.min(level, HORSE_MAX_LEVEL));
        // Refresh the whole points packet: the client reads the riding skill
        // level from POINT_HORSE_SKILL, not from the skill-level packet alone.
        this.owner.sendPoints();
        if (this.level > 0) {
            const stat = HORSE_STATS[this.level];
            this.health = stat.maxHealth;
            this.stamina = stat.maxStamina;
        } else {
            this.health = 0;
            this.stamina = 0;
        }
        this.owner.recalculatePoints();
        this.owner.save();
    }

    /**
     * Whether enough time passed since the last mount change. Refuses (with a
     * chat message) while the client is still fading the previous horse out.
     */
    private canChangeMount(): boolean {
        if (Date.now() - this.lastMountChangeAt >= HORSE_MOUNT_COOLDOWN_MS) return true;

        this.owner.chat({
            messageType: ChatMessageTypeEnum.INFO,
            message: 'Your horse needs a moment.',
        });
        return false;
    }

    /** Begin riding. Returns true if state changed. */
    startRiding(): boolean {
        if (this.riding) return false;
        if (!this.canChangeMount()) return false;

        // Original behaviour: mounting is refused while the private shop is
        // open (otherwise the rider carries the shop stand around).
        if (this.owner.isRunningPrivateShop()) {
            this.owner.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: 'You cannot ride while your shop is open.',
            });
            return false;
        }

        if (this.level <= 0) {
            this.owner.chat({ messageType: ChatMessageTypeEnum.INFO, message: 'You do not own a horse.' });
            return false;
        }
        if (this.health <= 0) {
            this.owner.chat({ messageType: ChatMessageTypeEnum.INFO, message: 'Your horse is dead.' });
            return false;
        }
        if (this.stamina <= 0) {
            this.owner.chat({ messageType: ChatMessageTypeEnum.INFO, message: 'Your horse has no stamina.' });
            return false;
        }

        // Despawn any existing horse entity when mounting
        this.despawnHorseEntity();

        this.riding = true;
        this.lastMountChangeAt = Date.now();
        this.mountVnum = getHorseVnumByLevel(this.level);

        this.owner.broadcastMountChange();
        // Riding swaps the effective ST/DX/HT/IQ for the horse's stats, so the
        // client needs a fresh points packet (which also carries POINT_MOUNT).
        this.owner.recalculatePoints();
        this.owner.sendPoints();
        this.startStaminaConsume();
        this.sendHorseState();
        return true;
    }

    /** Mount a rental horse without changing the player's owned horse state. */
    startTemporaryRiding(mountVnum: number, durationMs: number): boolean {
        if (this.riding || durationMs <= 0) return false;
        if (!this.canChangeMount()) return false;
        if (this.owner.isRunningPrivateShop()) {
            this.owner.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: 'You cannot ride while your shop is open.',
            });
            return false;
        }

        this.despawnHorseEntity();
        this.riding = true;
        this.temporaryRiding = true;
        this.lastMountChangeAt = Date.now();
        this.mountVnum = mountVnum;
        this.owner.broadcastMountChange();
        this.owner.recalculatePoints();
        this.owner.sendPoints();
        this.owner.addEventTimer({
            id: TEMPORARY_HORSE_RIDE,
            eventFunction: () => this.stopTemporaryRiding(),
            options: { interval: durationMs, duration: durationMs },
        });
        return true;
    }

    /**
     * Stop riding. Returns true if state changed.
     * `forced` skips the mount cooldown for dismounts the player did not ask
     * for (horse death, opening a shop, rental expiry).
     */
    stopRiding(forced: boolean = false): boolean {
        if (!this.riding) return false;

        if (this.temporaryRiding) {
            return this.stopTemporaryRiding();
        }

        if (!forced && !this.canChangeMount()) return false;

        this.riding = false;
        this.lastMountChangeAt = Date.now();
        this.mountVnum = 0;

        this.owner.broadcastMountChange();
        this.owner.recalculatePoints();
        this.owner.sendPoints();
        this.startStaminaRegen();
        this.sendHorseState();

        // Spawn horse entity at player location
        this.spawnHorseEntity();

        return true;
    }

    private stopTemporaryRiding(): boolean {
        if (!this.riding || !this.temporaryRiding) return false;

        this.owner.removeEventTimer(TEMPORARY_HORSE_RIDE);
        this.riding = false;
        this.temporaryRiding = false;
        this.mountVnum = 0;
        this.owner.broadcastMountChange();
        this.owner.recalculatePoints();
        this.owner.sendPoints();
        return true;
    }

    /**
     * Send away the spawned horse entity (only works when NOT riding).
     * Returns true if a horse entity was dismissed, false if not riding or no entity spawned.
     */
    sendAway(): boolean {
        // Can only send away if NOT riding and horse entity is active
        if (this.riding || !this.spawnedHorse) {
            return false;
        }

        this.despawnHorseEntity();
        this.clearHorseState();
        return true;
    }

    /** Revive a dead horse and mount it. Returns true on success. */
    revive(): boolean {
        if (this.level <= 0 || this.health > 0) return false;
        const stat = HORSE_STATS[this.level];
        this.health = stat.maxHealth;
        this.stamina = stat.maxStamina;

        // Auto-mount after revive (issue #41), so every revive path behaves
        // the same. startRiding also despawns the corpse entity, replacing
        // the original's HorseSummon(false)/HorseSummon(true) toggle.
        this.startRiding();

        this.sendHorseState();
        this.owner.save();
        return true;
    }

    /** Feed the horse to restore 1 health point. Returns whether health changed. */
    feed(): boolean {
        if (this.level <= 0 || this.health <= 0 || this.health >= this.getMaxHealth()) return false;

        this.health += 1;
        this.sendHorseState();
        this.owner.save();
        return true;
    }

    /** Directly set horse health (used by GM horse_set_stat). */
    setHealth(value: number): void {
        this.health = Math.max(0, Math.min(value, this.getMaxHealth()));
        if (this.health === 0) {
            this.handleDeath();
        }
        this.sendHorseState();
        this.owner.save();
    }

    /** Directly set horse stamina (used by GM horse_set_stat). */
    setStamina(value: number): void {
        this.stamina = Math.max(0, Math.min(value, this.getMaxStamina()));
        this.sendHorseState();
        this.owner.save();
    }

    private handleDeath(): void {
        this.stamina = 0;
        this.owner.removeEventTimer(HORSE_STAMINA_CONSUME);
        this.owner.removeEventTimer(HORSE_STAMINA_REGEN);
        this.owner.removeEventTimer(HORSE_FOLLOW_TIMER);

        // Turn the spawned horse into a corpse: stop following, play the death
        // animation for everyone nearby and leave the body on the ground for a
        // while before it despawns. The entity stays alive server-side so the
        // owner can still click it to open the revive menu (issue #42).
        if (this.spawnedHorse) {
            this.spawnedHorse.clearMovementNodes();
            this.owner.showHorseCorpse(this.spawnedHorse);
            this.startDeadDespawnTimer();
        }

        if (this.riding) {
            this.riding = false;
            this.temporaryRiding = false;
            this.mountVnum = 0;
            this.owner.removeEventTimer(TEMPORARY_HORSE_RIDE);
            this.owner.broadcastMountChange();
            // Forced dismount swaps the effective stats back to the player's.
            this.owner.recalculatePoints();
            this.owner.sendPoints();
            // The horse died under the rider: leave its corpse on the ground
            // (clickable for the owner, issue #42) instead of vanishing.
            this.spawnHorseEntity();
        }
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    /**
     * Spawns a horse entity at a nearby location when the player unmounts.
     */
    private spawnHorseEntity(): void {
        // Don't spawn if horse is already spawned, has no level, or is riding
        if (this.spawnedHorse !== null || this.level <= 0 || this.isRiding()) {
            return;
        }

        const area = this.owner.getArea();

        if (!area) {
            this.owner.logger.debug(`[PlayerHorse] cannot spawn horse: no area, level=${this.level}`);
            return;
        }

        try {
            // Calculate spawn position near player (100-200 units offset)
            const playerX = this.owner.getPositionX();
            const playerY = this.owner.getPositionY();

            const offsetDistance = MathUtil.getRandomInt(100, 200);
            const angle = MathUtil.degreeToRadian(MathUtil.getRandomInt(0, 359));
            const spawnX = Math.round(playerX + Math.cos(angle) * offsetDistance);
            const spawnY = Math.round(playerY + Math.sin(angle) * offsetDistance);

            // Get horse vnum based on level
            const horseVnum = getHorseVnumByLevel(this.level);

            // Create the horse mob (virtualId assigned by the entity manager)
            // and spawn it in the area. Direction: 180 (opposite direction).
            const horseEntity = area.spawnMob(horseVnum, spawnX, spawnY, 180);

            if (!horseEntity) {
                this.owner.logger.debug(`[PlayerHorse] horse vnum ${horseVnum} was not found`);
                return;
            }

            // Set horse name to custom horse name or player's name + "'s Horse"
            const playerName = this.owner.getName();
            (horseEntity as any).name = this.horseName || `${playerName}'s Horse`;

            // Show the horse's real level instead of the proto's (original:
            // m_chHorse->SetLevel(GetHorseLevel())).
            horseEntity.setPoint(PointsEnum.LEVEL, this.level);

            horseEntity.setHorseStats(this);
            this.spawnedHorse = horseEntity;

            if (this.health <= 0) {
                // A dead horse is summoned lying on the ground and despawns on
                // its own after a while (original: HorseSummon + POS_DEAD).
                // Kept alive server-side so the owner can click it (issue #42);
                // viewers get the dead pose via the corpse flag on spawn.
                this.owner.showHorseCorpse(horseEntity);
                this.startDeadDespawnTimer();
            } else {
                this.startHorseFollow();
            }

            this.owner.logger.debug(
                `[PlayerHorse] spawned horse vnum=${horseVnum} vid=${horseEntity.getVirtualId()} at=${spawnX},${spawnY} dead=${this.health <= 0}`,
            );
        } catch (error) {
            this.owner.logger.error(error instanceof Error ? error : String(error));
        }
    }

    /**
     * Despawns the horse entity when the player mounts.
     */
    private despawnHorseEntity(): void {
        this.owner.removeEventTimer(HORSE_FOLLOW_TIMER);
        this.owner.removeEventTimer(HORSE_DEAD_DESPAWN_TIMER);

        if (!this.spawnedHorse) {
            return;
        }

        this.spawnedHorse.clearMovementNodes();
        this.spawnedHorse.setHorseStats(null);

        const area = this.owner.getArea();
        if (area) {
            area.despawn(this.spawnedHorse);
        }

        this.spawnedHorse = null;
    }

    private startDeadDespawnTimer(): void {
        this.owner.addEventTimer({
            id: HORSE_DEAD_DESPAWN_TIMER,
            eventFunction: () => this.despawnHorseEntity(),
            options: { interval: HORSE_DEAD_DESPAWN_MS, duration: HORSE_DEAD_DESPAWN_MS },
        });
    }

    private startHorseFollow(): void {
        const horse = this.spawnedHorse;
        if (!horse) return;

        horse.moveAlongNodes(() => {
            if (this.riding || this.spawnedHorse !== horse) return null;

            const playerX = this.owner.getPositionX();
            const playerY = this.owner.getPositionY();
            const deltaX = playerX - horse.getPositionX();
            const deltaY = playerY - horse.getPositionY();
            const distance = Math.hypot(deltaX, deltaY);
            if (distance <= HORSE_FOLLOW_DISTANCE) {
                this.owner.logger.debug(`[PlayerHorse] follow idle: distance=${Math.round(distance)}`);
                return null;
            }

            const approach = MathUtil.getRandomInt(HORSE_FOLLOW_MIN_APPROACH, HORSE_FOLLOW_MAX_APPROACH);
            const scale = Math.max(0, (distance - approach) / distance);
            const targetX = Math.round(playerX - deltaX * scale);
            const targetY = Math.round(playerY - deltaY * scale);
            this.owner.logger.debug(
                `[PlayerHorse] follow move: horse=${horse.getPositionX()},${horse.getPositionY()} player=${playerX},${playerY} distance=${Math.round(distance)} target=${targetX},${targetY}`,
            );
            return { x: targetX, y: targetY };
        });

        this.owner.addEventTimer({
            id: HORSE_FOLLOW_TIMER,
            eventFunction: () => {
                if (this.spawnedHorse === horse && !this.riding && horse.getState() === EntityStateEnum.IDLE) {
                    horse.continueMovementNodes();
                }
            },
            options: { interval: HORSE_FOLLOW_INTERVAL_MS },
        });
    }

    /**
     * Sends the `horse_state <level> <healthGrade> <staminaGrade>` command to
     * the client
     */
    private sendHorseState(): void {
        if (this.level <= 0) return;

        const hp = this.health;
        const maxHp = this.getMaxHealth();
        const st = this.stamina;
        const maxSt = this.getMaxStamina();

        let healthGrade: number;
        if (hp <= 0) healthGrade = 0;
        else if (hp * 10 <= maxHp * 3) healthGrade = 1;
        else if (hp * 10 <= maxHp * 7) healthGrade = 2;
        else healthGrade = 3;

        let staminaGrade: number;
        if (st * 10 <= maxSt) staminaGrade = 0;
        else if (st * 10 <= maxSt * 3) staminaGrade = 1;
        else if (st * 10 <= maxSt * 7) staminaGrade = 2;
        else staminaGrade = 3;

        this.owner.chat({
            messageType: ChatMessageTypeEnum.COMMAND,
            message: `horse_state ${this.level} ${healthGrade} ${staminaGrade}`,
        });
    }

    private clearHorseState(): void {
        this.owner.chat({
            messageType: ChatMessageTypeEnum.COMMAND,
            message: `horse_state 0 0 0`,
        });
    }

    private startStaminaConsume(): void {
        if (this.owner.isEventTimerActive(HORSE_STAMINA_CONSUME)) return;
        this.owner.addEventTimer({
            id: HORSE_STAMINA_CONSUME,
            eventFunction: () => {
                if (!this.riding || this.health <= 0) return;
                this.stamina = Math.max(0, this.stamina - 1);
                if (this.stamina <= 0) this.stopRiding(true);
                this.sendHorseState();
                this.owner.save();
            },
            options: { interval: STAMINA_CONSUME_INTERVAL_MS, duration: STAMINA_CONSUME_INTERVAL_MS },
        });
    }

    private startStaminaRegen(): void {
        if (this.owner.isEventTimerActive(HORSE_STAMINA_REGEN)) return;
        this.owner.addEventTimer({
            id: HORSE_STAMINA_REGEN,
            eventFunction: () => {
                if (this.riding || this.health <= 0) return;
                const maxSt = this.getMaxStamina();
                this.stamina = Math.min(maxSt, this.stamina + 1);
                this.sendHorseState();
                this.owner.save();
            },
            options: { interval: STAMINA_REGEN_INTERVAL_MS, duration: STAMINA_REGEN_INTERVAL_MS },
        });
    }
}
