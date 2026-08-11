import { QuestManager } from '@/core/domain/quests/QuestManager';
import { Mob, MobParams } from './Mob';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';
import AnimationManager from '@/core/domain/manager/AnimationManager';
import { EntityStateEnum } from '@/core/enum/EntityStateEnum';
import GlobalEventTimerManager from '@/core/domain/manager/GlobalEventTimeManager';

/** Minimal surface of the rider's horse delegate that a summoned horse reads its health from. */
export interface IHorseStats {
    getHealth(): number;
    getMaxHealth(): number;
}

export default class NPC extends Mob {
    /** Set while this NPC is a player's summoned horse, so TARGET reports the rider's horse health. */
    private horseStats: IHorseStats | null = null;

    constructor(
        params: Omit<MobParams, 'entityType'>,
        {
            animationManager,
            questManager,
            eventTimerManager,
        }: {
            animationManager: AnimationManager;
            questManager: QuestManager;
            eventTimerManager: GlobalEventTimerManager;
        },
    ) {
        super(
            {
                ...params,
                entityType: EntityTypeEnum.NPC,
            },
            { animationManager, questManager, eventTimerManager },
        );

        this.stateMachine
            .addState({
                name: EntityStateEnum.IDLE,
                onTick: this.idleStateTick.bind(this),
                onStart: this.idleStateStart.bind(this),
            })
            .addState({
                name: EntityStateEnum.MOVING,
                onTick: this.movingStateTick.bind(this),
            })
            .gotoState(EntityStateEnum.IDLE);
    }

    onDespawn(): void {}

    onSpawn(): void {}

    setHorseStats(horseStats: IHorseStats | null): void {
        this.horseStats = horseStats;
    }

    applyPoison(): void {
        throw new Error('Method not implemented.');
    }
    applyStun(): void {
        throw new Error('Method not implemented.');
    }
    applySlow(): void {
        throw new Error('Method not implemented.');
    }
    getHealthPercentage(): number {
        if (!this.horseStats) return 100;

        const maxHealth = this.horseStats.getMaxHealth();

        if (!maxHealth) return 100;

        return Math.round(Math.max(0, Math.min(100, (this.horseStats.getHealth() * 100) / maxHealth)));
    }
    getAttack(): number {
        throw new Error('Method not implemented.');
    }
    getDefense(): number {
        throw new Error('Method not implemented.');
    }
    attack(): void {
        throw new Error('Method not implemented.');
    }
    damage(): number {
        throw new Error('Method not implemented.');
    }
    takeDamage(): void {
        throw new Error('Method not implemented.');
    }
}
