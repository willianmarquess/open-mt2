import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import {
    HORSE_MAX_LEVEL,
    HORSE_STATS,
    getHorseGrade,
    getHorseVnumByLevel,
} from '@/core/domain/entities/game/horse/HorseStats';
import type NPC from '../../mob/NPC';

/** Minimal surface of Player that PlayerHorse needs to call back into. */
export interface IHorseOwner {
    chat(opts: { messageType: ChatMessageTypeEnum; message: string }): void;
    isEventTimerActive(id: string): boolean;
    addEventTimer(opts: {
        id: string;
        eventFunction: () => void;
        options: { interval: number; duration: number };
    }): void;
    /** Broadcast updated mountId to self + nearby players. */
    broadcastMountChange(): void;
    /** Get player's current position X. */
    getPositionX(): number;
    /** Get player's current position Y. */
    getPositionY(): number;
    /** Get player's name. */
    getName(): string;
    /** Get player's area for spawning entities. */
    getArea(): any; // Area type
    /** Get MobManager for creating horse entities. */
    getMobManager(): any; // MobManager type
    /** Set a point value (e.g., MOUNT, HORSE_SKILL). */
    setPoint(point: PointsEnum, value: number): void;
    /** Save character stats. */
    save(): void;
}

const STAMINA_CONSUME_INTERVAL_MS = 6 * 60 * 1_000; // 6 min per tick
const STAMINA_REGEN_INTERVAL_MS = 12 * 60 * 1_000; // 12 min per tick

export class PlayerHorse {
    private level: number = 0;
    private health: number = 0;
    private stamina: number = 0;
    private riding: boolean = false;
    private mountVnum: number = 0;
    private spawnedHorse: NPC | null = null; // Spawned horse entity when not riding
    private horseName: string = '';

    private readonly owner: IHorseOwner;

    constructor(owner: IHorseOwner) {
        this.owner = owner;
    }

    initialize(level: number, health: number, stamina: number, name: string): void {
        this.level = level;
        this.health = health;
        this.stamina = stamina;
        this.horseName = name;
    }

    // ── Accessors ──────────────────────────────────────────────────────────────

    getSpawnedHorse(): NPC | null {
        return this.spawnedHorse;
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

    isRiding(): boolean {
        return this.riding;
    }

    // ── Mutations ──────────────────────────────────────────────────────────────

    setLevel(level: number): void {
        this.level = Math.max(0, Math.min(level, HORSE_MAX_LEVEL));
        if (this.level > 0) {
            const stat = HORSE_STATS[this.level];
            this.health = stat.maxHealth;
            this.stamina = stat.maxStamina;
        } else {
            this.health = 0;
            this.stamina = 0;
        }
        this.owner.save();
    }

    /** Begin riding. Returns true if state changed. */
    startRiding(): boolean {
        if (this.riding) return false;

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
        this.mountVnum = getHorseVnumByLevel(this.level);

        // Set MOUNT and HORSE_SKILL points for client to display riding animation
        this.owner.setPoint(PointsEnum.MOUNT, this.mountVnum);
        this.owner.setPoint(PointsEnum.HORSE_SKILL, this.level);

        this.owner.broadcastMountChange();
        this.startStaminaConsume();
        this.sendHorseState();
        return true;
    }

    /** Stop riding. Returns true if state changed. */
    stopRiding(): boolean {
        if (!this.riding) return false;

        this.riding = false;
        this.mountVnum = 0;

        // Clear MOUNT and HORSE_SKILL points
        this.owner.setPoint(PointsEnum.MOUNT, 0);
        this.owner.setPoint(PointsEnum.HORSE_SKILL, 0);

        this.owner.broadcastMountChange();
        this.startStaminaRegen();
        this.sendHorseState();

        // Spawn horse entity at player location
        this.spawnHorseEntity();

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

    /** Revive a dead horse. Returns true on success. */
    revive(): boolean {
        if (this.level <= 0 || this.health > 0) return false;
        const stat = HORSE_STATS[this.level];
        this.health = stat.maxHealth;
        this.stamina = stat.maxStamina;
        this.sendHorseState();
        this.owner.save();
        return true;
    }

    /** Feed the horse to restore 1 health point. */
    feed(): void {
        if (this.level > 0 && this.health > 0) {
            this.health = Math.min(this.health + 1, this.getMaxHealth());
            this.sendHorseState();
            this.owner.save();
        }
    }

    /** Directly set horse health (used by GM horse_set_stat). */
    setHealth(value: number): void {
        this.health = Math.max(0, Math.min(value, this.getMaxHealth()));
        this.sendHorseState();
        this.owner.save();
    }

    /** Directly set horse stamina (used by GM horse_set_stat). */
    setStamina(value: number): void {
        this.stamina = Math.max(0, Math.min(value, this.getMaxStamina()));
        this.sendHorseState();
        this.owner.save();
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    /**
     * Spawns a horse entity at a nearby location when the player unmounts.
     * Similar to C++ HorseSummon(true, true, dwVnum) behavior.
     */
    private spawnHorseEntity(): void {
        // Don't spawn if horse is already spawned, has no level, or is riding
        if (this.spawnedHorse !== null || this.level <= 0 || this.isRiding()) {
            return;
        }

        const area = this.owner.getArea();
        const mobManager = this.owner.getMobManager();

        if (!area || !mobManager) {
            // Silently fail - area or mobManager not initialized yet
            return;
        }

        try {
            // Calculate spawn position near player (100-200 units offset)
            const playerX = this.owner.getPositionX();
            const playerY = this.owner.getPositionY();

            const offsetDistance = 100 + Math.random() * 100;
            const angle = Math.random() * Math.PI * 2;
            const spawnX = Math.round(playerX + Math.cos(angle) * offsetDistance);
            const spawnY = Math.round(playerY + Math.sin(angle) * offsetDistance);

            // Get horse vnum based on level
            const horseVnum = getHorseVnumByLevel(this.level);

            // Create horse entity via MobManager
            // Direction: 180 (opposite direction)
            const horseEntity = mobManager.getMob(horseVnum, spawnX, spawnY, 180);

            if (!horseEntity) {
                // Horse vnum not found in mob database
                return;
            }

            // Set horse name to custom horse name or player's name + "'s Horse"
            const playerName = this.owner.getName();
            (horseEntity as any).name = this.horseName || `${playerName}'s Horse`;

            // Spawn in the area with proper virtualId assignment
            area.spawnMobEntity(horseEntity);
            this.spawnedHorse = horseEntity;
        } catch (error) {
            // Silently fail - horse spawning is cosmetic
            console.error('Failed to spawn horse entity:', error);
        }
    }

    /**
     * Despawns the horse entity when the player mounts.
     */
    private despawnHorseEntity(): void {
        if (!this.spawnedHorse) {
            return;
        }

        const area = this.owner.getArea();
        if (area) {
            area.despawn(this.spawnedHorse);
        }

        this.spawnedHorse = null;
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
        if (this.owner.isEventTimerActive('HORSE_STAMINA_CONSUME')) return;
        this.owner.addEventTimer({
            id: 'HORSE_STAMINA_CONSUME',
            eventFunction: () => {
                if (!this.riding || this.health <= 0) return;
                this.stamina = Math.max(0, this.stamina - 1);
                if (this.stamina <= 0) this.stopRiding();
                this.sendHorseState();
                this.owner.save();
            },
            options: { interval: STAMINA_CONSUME_INTERVAL_MS, duration: STAMINA_CONSUME_INTERVAL_MS },
        });
    }

    private startStaminaRegen(): void {
        if (this.owner.isEventTimerActive('HORSE_STAMINA_REGEN')) return;
        this.owner.addEventTimer({
            id: 'HORSE_STAMINA_REGEN',
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
