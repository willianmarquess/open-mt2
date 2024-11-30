import EntityStateEnum from '../../../../enum/EntityStateEnum.js';
import EntityTypeEnum from '../../../../enum/EntityTypeEnum.js';
import MathUtil from '../../../util/MathUtil.js';
import Player from '../player/Player.js';
import Behavior from './Behavior.js';
import MonsterDiedEvent from './events/MonsterDiedEvent.js';
import MonsterMovedEvent from './events/MonsterMovedEvent.js';
import Mob from './Mob.js';

export default class Monster extends Mob {
    #group;
    #behavior;
    #behaviorInitialized = false;
    #health = 0;
    #maxHealth = 0;

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
        this.#health = maxHp;
        this.#maxHealth = maxHp;
        this.#behavior = new Behavior(this);
    }

    get group() {
        return this.#group;
    }

    set group(value) {
        this.#group = value;
    }

    getHealthPercentage() {
        return Math.round(Math.max(0, Math.min(100, (this.#health * 100) / this.#maxHealth)));
    }

    takeDamage(attacker, damage) {
        if (!(attacker instanceof Player)) return;

        this.state = EntityStateEnum.BATTLE;

        attacker.sendDamageCaused({
            virtualId: this.virtualId,
            damage,
            damageFlags: 1,
        });

        this.#health -= damage;

        this.broadcastMyTarget();

        if (this.#health <= 0) {
            this.die();
            //TODO: add drop and add exp to player
        }

        this.state = EntityStateEnum.IDLE;
    }

    die() {
        if (this.isDead) return;

        super.die();

        this.publish(
            MonsterDiedEvent.type,
            new MonsterDiedEvent({
                entity: this,
            }),
        );
    }

    goto(x, y) {
        const rotation = MathUtil.calcRotationFromXY(x - this.positionX, y - this.positionY) / 5;
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

        if (this.isDead) return;

        if (!this.#behaviorInitialized) {
            this.#behavior.init();
            this.#behaviorInitialized = true;
        }

        this.#behavior.tick();
    }

    getDefense() {
        return Math.floor(this.level * 3 + this.st * 4 + this.def);
    }

    getRespawnTimeInMs() {
        return this.group?.spawnConfig?.getRespawnTimeInMs();
    }

    reset() {
        this.#behaviorInitialized = false;
        this.isDead = false;
        this.#health = this.#maxHealth;
        //TODO: spawn at original location
    }
}
