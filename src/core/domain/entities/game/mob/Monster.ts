import DropManager from '@/core/domain/manager/DropManager';
import MathUtil from '../../../util/MathUtil';
import Player from '../player/Player';
import Behavior from './Behavior';
import MonsterDiedEvent from './events/MonsterDiedEvent';
import MonsterMovedEvent from './events/MonsterMovedEvent';
import { Mob, MobParams } from './Mob';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';
import { EntityStateEnum } from '@/core/enum/EntityStateEnum';
import ExperienceManager from '@/core/domain/manager/ExperienceManager';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { FlyEnum } from '@/core/enum/FlyEnum';
import FlyEffectCreatedEvent from '../shared/event/FlyEffectCreatedEvent';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';
import CharacterUpdatedEvent from '../shared/event/CharacterUpdatedEvent';
import { PointsEnum } from '@/core/enum/PointsEnum';

const MAX_DISTANCE_TO_GET_EXP = 5_000;

export default class Monster extends Mob {
    private readonly behavior: Behavior;
    private behaviorInitialized: boolean = false;
    private health: number = 0;

    private readonly dropManager: DropManager;
    private readonly experienceManager: ExperienceManager;

    constructor(
        params: Omit<MobParams, 'virtualId' | 'entityType'>,
        { animationManager, dropManager, experienceManager },
    ) {
        super(
            {
                ...params,
                entityType: EntityTypeEnum.MONSTER,
            },
            { animationManager },
        );
        this.dropManager = dropManager;
        this.experienceManager = experienceManager;
        this.health = this.maxHealth;
        this.behavior = new Behavior(this);
        this.init();
    }

    private init() {
        this.points.set(PointsEnum.MAX_HEALTH, () => this.maxHealth);
        this.points.set(PointsEnum.DEFENSE, () => this.getDefense());
        this.points.set(PointsEnum.ATTACK_GRADE, () => this.getAttack());
        this.points.set(PointsEnum.MAX_MANA, () => this.maxMana);
        this.points.set(PointsEnum.HEALTH, () => this.health);
        this.points.set(PointsEnum.LEVEL, () => this.level);

        this.initEvents();
    }

    private initEvents() {
        this.eventTimerManager.addTimer({
            id: 'REGEN_HEALTH',
            eventFunction: this.regenHealth.bind(this),
            options: {
                interval: this.regenCycle * 1_000,
            },
        });
    }

    public sendUpdateEvent() {
        this.publish(
            new CharacterUpdatedEvent({
                affects: this.getAffectFlags(),
                attackSpeed: this.getAttackSpeed(),
                moveSpeed: this.getMovementSpeed(),
                bodyId: 0,
                hairId: 0,
                weaponId: 0,
                name: this.name,
                positionX: this.getPositionX(),
                positionY: this.getPositionY(),
                vid: this.getVirtualId(),
            }),
        );
    }

    private regenHealth() {
        if (this.isAffectByFlag(AffectBitsTypeEnum.POISON)) return;
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

    takeDamage(attacker: Player, damage: number) {
        this.health -= damage;
        this.behavior.onDamage(attacker, damage);

        this.broadcastMyTarget();

        if (this.health <= 0) {
            this.die();
            this.reward();
            return;
        }
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
        if (this.isAffectByFlag(AffectBitsTypeEnum.STUN)) return;
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
        if (this.isAffectByFlag(AffectBitsTypeEnum.STUN)) return;

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
        this.initEvents();
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
