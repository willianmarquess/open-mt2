import EntityTypeEnum from '../../../../enum/EntityTypeEnum.js';
import MathUtil from '../../../util/MathUtil.js';
import Behavior from './Behavior.js';
import MonsterMovedEvent from './events/MonsterMovedEvent.js';
import Mob from './Mob.js';

export default class Monster extends Mob {
    #group;
    #behavior;
    #behaviorInitialized = false;

    constructor(
        {
            id,
            virtualId,
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
                entityType: EntityTypeEnum.MONSTER,
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
        this.#behavior = new Behavior(this);
    }

    get group() {
        return this.#group;
    }

    set group(value) {
        this.#group = value;
    }

    goto(x, y) {
        const rotation = MathUtil.calcRotation(x - this.positionX, y - this.positionY) / 5;
        super.goto(x, y, rotation);
        this.publish(
            MonsterMovedEvent.type,
            new MonsterMovedEvent({
                params: {
                    positionX: x,
                    positionY: y,
                    arg: 0,
                    rotation,
                    time: performance.now(),
                    duration: this.movementDuration,
                },
                entity: this,
            }),
        );
    }

    tick() {
        super.tick();

        if (!this.#behaviorInitialized) {
            this.#behavior.init();
            this.#behaviorInitialized = true;
        }

        this.#behavior.tick();
    }
}
