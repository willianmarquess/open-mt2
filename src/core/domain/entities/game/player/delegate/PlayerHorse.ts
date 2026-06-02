import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import {
    HORSE_MAX_LEVEL,
    HORSE_STATS,
    getHorseGrade,
    getHorseVnumByLevel,
} from '@/core/domain/entities/game/horse/HorseStats';

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
}

const STAMINA_CONSUME_INTERVAL_MS = 6 * 60 * 1_000; // 6 min per tick
const STAMINA_REGEN_INTERVAL_MS = 12 * 60 * 1_000; // 12 min per tick

export class PlayerHorse {
    private level: number = 0;
    private health: number = 0;
    private stamina: number = 0;
    private riding: boolean = false;
    private mountVnum: number = 0;

    private readonly owner: IHorseOwner;

    constructor(owner: IHorseOwner) {
        this.owner = owner;
    }

    // ── Accessors ──────────────────────────────────────────────────────────────

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

        this.riding = true;
        this.mountVnum = getHorseVnumByLevel(this.level);
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
        this.owner.broadcastMountChange();
        this.startStaminaRegen();
        this.sendHorseState();
        return true;
    }

    /** Revive a dead horse. Returns true on success. */
    revive(): boolean {
        if (this.level <= 0 || this.health > 0) return false;
        const stat = HORSE_STATS[this.level];
        this.health = stat.maxHealth;
        this.stamina = stat.maxStamina;
        this.sendHorseState();
        return true;
    }

    /** Feed the horse to restore 1 health point. */
    feed(): void {
        if (this.level > 0 && this.health > 0) {
            this.health = Math.min(this.health + 1, this.getMaxHealth());
            this.sendHorseState();
        }
    }

    /** Directly set horse health (used by GM horse_set_stat). */
    setHealth(value: number): void {
        this.health = Math.max(0, Math.min(value, this.getMaxHealth()));
        this.sendHorseState();
    }

    /** Directly set horse stamina (used by GM horse_set_stat). */
    setStamina(value: number): void {
        this.stamina = Math.max(0, Math.min(value, this.getMaxStamina()));
        this.sendHorseState();
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    /**
     * Sends the `horse_state <level> <healthGrade> <staminaGrade>` command to
     * the client - same format as the reference C++ server's SendHorseInfo().
     */
    sendHorseState(): void {
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

    private startStaminaConsume(): void {
        if (this.owner.isEventTimerActive('HORSE_STAMINA_CONSUME')) return;
        this.owner.addEventTimer({
            id: 'HORSE_STAMINA_CONSUME',
            eventFunction: () => {
                if (!this.riding || this.health <= 0) return;
                this.stamina = Math.max(0, this.stamina - 1);
                if (this.stamina <= 0) this.stopRiding();
                this.sendHorseState();
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
            },
            options: { interval: STAMINA_REGEN_INTERVAL_MS, duration: STAMINA_REGEN_INTERVAL_MS },
        });
    }
}
