import DropManager from '@/core/domain/manager/DropManager';
import MathUtil from '../../../util/MathUtil';
import Player from '../player/Player';
import Behavior from './Behavior';
import MonsterDiedEvent from './events/MonsterDiedEvent';
import MonsterMovedEvent from './events/MonsterMovedEvent';
import Mob from './Mob';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';
import { EntityStateEnum } from '@/core/enum/EntityStateEnum';
import ExperienceManager from '@/core/domain/manager/ExperienceManager';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { FlyEnum } from '@/core/enum/FlyEnum';
import FlyEffectCreatedEvent from '../shared/event/FlyEffectCreatedEvent';
import { DamageTypeEnum } from '@/core/enum/DamageTypeEnum';
import Character from '../Character';
import { AffectTypeEnum } from '@/core/enum/AffectTypeEnum';
import BitFlag from '@/core/util/BitFlag';
import { DamageFlagEnum } from '@/core/enum/DamageFlagEnum';

const MAX_DISTANCE_TO_GET_EXP = 5_000;

export default class Monster extends Mob {
    private readonly behavior: Behavior;
    private behaviorInitialized: boolean = false;
    private health: number = 0;

    private readonly dropManager: DropManager;
    private readonly experienceManager: ExperienceManager;

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
        { animationManager, dropManager, experienceManager },
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
        this.dropManager = dropManager;
        this.experienceManager = experienceManager;
        this.health = maxHp;
        this.maxHealth = maxHp;
        this.behavior = new Behavior(this);

        setInterval(this.regenHealth.bind(this), this.regenCycle * 1_000);
    }

    applyPoison(attacker: Character) {
        if (this.isAffectByFlag(AffectTypeEnum.POISON)) return;

        this.eventTimerManager.addTimer('POISON_AFFECT', () => {
            const damage = this.maxHealth * 0.05;
            this.takeDamage(attacker, damage, DamageTypeEnum.POISON);
        }, {
            interval: 1_000,
            duration: 10_000
        })

        //TODO: send affect packet
    }

    applyStun() {
        if (this.isAffectByFlag(AffectTypeEnum.STUN)) return;

        //TODO
    }

    applySlow() {
        if (this.isAffectByFlag(AffectTypeEnum.SLOW)) return;


        const actualMoveSpeed = this.getMovementSpeed();
        this.setMovementSpeed(actualMoveSpeed - (actualMoveSpeed * 0.4));
        //TODO: send affect packet

        this.eventTimerManager.addTimer('SLOW_AFFECT', () => {
            this.setMovementSpeed(actualMoveSpeed);
        }, {
            interval: 10_000,
            duration: 10_000,
            repeatCount: 1
        })
    }

    regenHealth() {
        if (this.state === EntityStateEnum.DEAD) return;
        if (this.health >= this.maxHealth) return;

        const amount = Math.floor(this.maxHealth * (this.regenPercent / 100));
        this.addHealth(Math.max(1, amount));
    }

    addHealth(value: number) {
        this.health = Math.min(this.health + Math.max(value, 0), this.maxHealth);
    }

    getHealthPercentage() {
        return Math.round(Math.max(0, Math.min(100, (this.health * 100) / this.maxHealth)));
    }

    takeDamage(attacker: Character, damage: number, damageType: DamageTypeEnum) {
        if (!(attacker instanceof Player)) return;

        this.state = EntityStateEnum.BATTLE;

        const damageFlags = new BitFlag();

        if (damageType === DamageTypeEnum.POISON) {
            damageFlags.set(DamageFlagEnum.POISON);
        } else {
            damageFlags.set(DamageFlagEnum.NORMAL);
        }

        //TODO: verify critical, penetrate

        attacker.sendDamageCaused({
            virtualId: this.virtualId,
            damage,
            damageFlags,
        });

        this.health -= damage;
        this.behavior.onDamage(attacker, damage);

        this.broadcastMyTarget();

        if (this.health <= 0) {
            this.die();
            this.reward();
            return;
        }

        this.state = EntityStateEnum.IDLE;
    }

    reward() {
        const attacker = this.behavior.getTarget();
        const drops = this.dropManager.getDrops(attacker, this);

        for (const { item, count } of drops) {
            attacker.dropItem({ item, count });
        }

        this.giveExp();
    }

    giveExp() {
        const exp = this.getExp();

        const attackersSize = this.behavior.getTargets().size;
        const mostDamageAttacker = this.behavior.getTarget();

        for (const { player } of this.behavior.getTargets().values()) {
            let playerExp = exp / attackersSize;

            if (player === mostDamageAttacker) {
                playerExp *= 1.2;
            }

            const distance = MathUtil.calcDistance(
                player.getPositionX(),
                player.getPositionY(),
                this.getPositionX(),
                this.getPositionY(),
            );

            if (distance > MAX_DISTANCE_TO_GET_EXP) {
                continue;
            }

            const expToGive = this.experienceManager.calculateExpToGive(player, this, playerExp);

            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `Earned ${expToGive} of EXP after kill ${this.folder || this.name}`,
            });

            player.addExperience(expToGive);

            this.publish(
                new FlyEffectCreatedEvent({
                    fromVirtualId: this.virtualId,
                    toVirtualId: player.getVirtualId(),
                    type: FlyEnum.EXP,
                }),
            );
        }
    }

    die() {
        if (this.state === EntityStateEnum.DEAD) return;

        super.die();

        this.publish(
            new MonsterDiedEvent({
                entity: this,
            }),
        );
    }

    goto(x: number, y: number) {
        const rotation = MathUtil.calcRotationFromXY(x - this.positionX, y - this.positionY) / 5;
        super.gotoInternal(x, y, rotation);
        this.publish(
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
        if (this.state === EntityStateEnum.DEAD) return;

        super.tick();

        if (!this.behaviorInitialized) {
            this.behavior.init();
            this.behaviorInitialized = true;
        }

        this.behavior.tick();
    }

    getDefense() {
        return Math.floor(this.level * 3 + this.st * 4 + this.def);
    }

    getRespawnTimeInMs() {
        return this.group?.getSpawnConfig()?.getRespawnTimeInMs();
    }

    reset() {
        this.behaviorInitialized = false;
        this.state = EntityStateEnum.IDLE;
        this.health = this.maxHealth;
        //TODO: spawn at original location
    }

    getAttack(): number {
        throw new Error('Method not implemented.');
    }

    attack(): void {
        throw new Error('Method not implemented.');
    }

    damage(): number {
        throw new Error('Method not implemented.');
    }
}
