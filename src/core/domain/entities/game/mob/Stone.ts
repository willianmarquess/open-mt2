import { Mob, MobParams } from './Mob';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';

export default class Stone extends Mob {
    constructor(params: Omit<MobParams, 'virtualId' | 'entityType'>, { animationManager }) {
        super(
            {
                ...params,
                entityType: EntityTypeEnum.METIN_STONE,
            },
            { animationManager },
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
        throw new Error('Method not implemented.');
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
