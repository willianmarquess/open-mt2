import { QuestManager } from '@/core/domain/quests/QuestManager';
import { Mob, MobParams } from './Mob';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';
import AnimationManager from '@/core/domain/manager/AnimationManager';
import GlobalEventTimerManager from '@/core/domain/manager/GlobalEventTimeManager';

export default class NPC extends Mob {
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
    }

    onDespawn(): void {}

    onSpawn(): void {}

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
