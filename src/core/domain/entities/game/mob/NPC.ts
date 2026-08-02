import { QuestManager } from '@/core/domain/quests/QuestManager';
import { Mob, MobParams } from './Mob';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';
import AnimationManager from '@/core/domain/manager/AnimationManager';
import { EntityStateEnum } from '@/core/enum/EntityStateEnum';
import GlobalEventTimerManager from '@/core/domain/manager/GlobalEventTimeManager';

export default class NPC extends Mob {
    /**
     * When set, every viewer except this virtualId renders the NPC as a dead
     * body while the entity stays alive server-side. The client filters dead
     * actors out of mouse picking, so this is the only way to keep a "corpse"
     * clickable for its owner (used by the dead horse, issue #42).
     */
    private corpseOwnerVirtualId: number | null = null;

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

    setCorpseOwnerVirtualId(virtualId: number | null): void {
        this.corpseOwnerVirtualId = virtualId;
    }

    getCorpseOwnerVirtualId(): number | null {
        return this.corpseOwnerVirtualId;
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
        return 100;
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
