import Mob from './Mob';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';

export default class NPC extends Mob {
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
    constructor(
        {
            id,
            virtualId = 0,
            positionX,
            positionY,
            name,
            rank,
            battleType,
            level,
            size,
            aiFlag,
            mountCapacity,
            raceFlag,
            immuneFlag,
            empire,
            folder,
            onClick,
            st,
            dx,
            ht,
            iq,
            damageMin,
            damageMax,
            maxHp,
            regenCycle,
            regenPercent,
            goldMin,
            goldMax,
            exp,
            def,
            attackSpeed,
            movementSpeed,
            aggressiveHpPct,
            aggressiveSight,
            attackRange,
            dropItem,
            resurrectionId,
            damMultiply,
            summon,
            drainSp,
            mobColor,
            polymorphItem,
            hpPercentToGetBerserk,
            hpPercentToGetStoneSkin,
            hpPercentToGetGodspeed,
            hpPercentToGetDeathblow,
            hpPercentToGetRevive,
            direction,
        },
        { animationManager },
    ) {
        super(
            {
                id,
                virtualId,
                entityType: EntityTypeEnum.NPC,
                positionX,
                positionY,
                name,
                rank,
                battleType,
                level,
                size,
                aiFlag,
                mountCapacity,
                raceFlag,
                immuneFlag,
                empire,
                folder,
                onClick,
                st,
                dx,
                ht,
                iq,
                damageMin,
                damageMax,
                maxHp,
                regenCycle,
                regenPercent,
                goldMin,
                goldMax,
                exp,
                def,
                attackSpeed,
                movementSpeed,
                aggressiveHpPct,
                aggressiveSight,
                attackRange,
                dropItem,
                resurrectionId,
                damMultiply,
                summon,
                drainSp,
                mobColor,
                polymorphItem,
                hpPercentToGetBerserk,
                hpPercentToGetStoneSkin,
                hpPercentToGetGodspeed,
                hpPercentToGetDeathblow,
                hpPercentToGetRevive,
                direction,
            },
            { animationManager },
        );
    }
}
