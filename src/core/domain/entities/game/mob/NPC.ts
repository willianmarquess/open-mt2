import { QuestManager } from '@/core/domain/quests/QuestManager';
import { Mob, MobParams } from './Mob';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';
import AnimationManager from '@/core/domain/manager/AnimationManager';
import { EntityStateEnum } from '@/core/enum/EntityStateEnum';

export default class NPC extends Mob {
    constructor(
        params: Omit<MobParams, 'virtualId' | 'entityType'>,
        { animationManager, questManager }: { animationManager: AnimationManager; questManager: QuestManager },
    ) {
        super(
            {
                ...params,
                entityType: EntityTypeEnum.NPC,
            },
            { animationManager, questManager },
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
