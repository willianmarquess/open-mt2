import { EntityStateEnum } from '@/core/enum/EntityStateEnum';
import { EventEmitter } from 'node:events';
import AnimationManager from '../../manager/AnimationManager';
import DroppedItem from './item/DroppedItem';
import { AnimationTypeEnum } from '@/core/enum/AnimationTypeEnum';
import { AnimationSubTypeEnum } from '@/core/enum/AnimationSubTypeEnum';
import MathUtil from '../../util/MathUtil';
import AnimationUtil from '../../util/AnimationUtil';
import Monster from './mob/Monster';
import Player from './player/Player';
import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';

export default abstract class GameEntity {
    protected id: number;
    protected virtualId: number;
    protected entityType: number;
    protected classId: number = 0;
    protected name: string;
    protected level: number;
    protected empire: number;

    //movement and animation
    protected positionX: number = 0;
    protected positionY: number = 0;
    protected rotation: number = 0;
    protected targetPositionX: number = 0;
    protected targetPositionY: number = 0;
    protected startPositionX: number = 0;
    protected startPositionY: number = 0;
    protected state: EntityStateEnum = EntityStateEnum.IDLE;
    protected movementStart: number = 0;
    protected movementDuration: number = 0;
    protected movementSpeed: number = 0;
    protected attackSpeed: number = 0;

    protected st: number;
    protected dx: number;
    protected ht: number;
    protected iq: number;

    protected animationManager: AnimationManager;
    protected emitter = new EventEmitter();
    protected nearbyEntities = new Map<number, GameEntity>();

    protected target: GameEntity;
    protected targetedBy = new Map<number, GameEntity>();

    constructor(
        {
            id,
            classId,
            virtualId,
            entityType,
            positionX,
            positionY,
            movementSpeed,
            attackSpeed,
            st,
            dx,
            ht,
            iq,
            name,
            level,
            empire,
        },
        { animationManager },
    ) {
        this.id = id;
        this.classId = classId;
        this.virtualId = virtualId;
        this.entityType = entityType;
        this.positionX = positionX;
        this.positionY = positionY;
        this.movementSpeed = movementSpeed;
        this.attackSpeed = attackSpeed;
        this.st = st;
        this.dx = dx;
        this.ht = ht;
        this.iq = iq;
        this.name = name;
        this.level = level;
        this.empire = empire;

        this.animationManager = animationManager;
    }

    getAttackRating() {
        return Math.min(90, this.dx * 4 + (this.level * 2) / 6);
    }

    abstract getHealthPercentage(): number;
    abstract getAttack(): number;
    abstract getDefense(): number;
    abstract attack(victim: GameEntity, attackType: AttackTypeEnum): void;
    abstract damage(): number;
    abstract takeDamage(attacker: Player | Monster, damage: number): void;

    die() {
        this.state = EntityStateEnum.DEAD;
    }

    setTarget(target) {
        if (target instanceof GameEntity) {
            if (this.target) {
                this.target.removeTargetedBy(this);
            }
            this.target = target;
            target.addTargetedBy(this);
        }
    }

    removeTargetedBy(entity) {
        this.targetedBy.delete(entity.virtualId);
    }

    addTargetedBy(entity) {
        this.targetedBy.set(entity.virtualId, entity);
    }

    broadcastMyTarget() {
        for (const entity of this.targetedBy.values()) {
            if (entity instanceof Player) {
                entity.sendTargetUpdated(this);
            }
        }
    }

    tick() {
        if (this.state == EntityStateEnum.MOVING) {
            const elapsed = performance.now() - this.movementStart;
            let rate = this.movementDuration == 0 ? 1 : elapsed / this.movementDuration;
            if (rate > 1) rate = 1;

            const x = (this.targetPositionX - this.startPositionX) * rate + this.startPositionX;
            const y = (this.targetPositionY - this.startPositionY) * rate + this.startPositionY;

            this.positionX = x;
            this.positionY = y;

            if (rate >= 1) {
                this.state = EntityStateEnum.IDLE;
            }
        }
    }

    protected gotoInternal(x: number, y: number, rotation: number) {
        if (x === this.positionX && y === this.positionY) return;
        if (x === this.targetPositionX && y === this.targetPositionY) return;

        const animation = this.animationManager.getAnimation(
            String(this.classId),
            AnimationTypeEnum.RUN,
            AnimationSubTypeEnum.GENERAL,
        );

        this.state = EntityStateEnum.MOVING;
        this.targetPositionX = x;
        this.targetPositionY = y;
        this.startPositionX = this.positionX;
        this.startPositionY = this.positionY;
        this.movementStart = performance.now();

        const distance = MathUtil.calcDistance(
            this.startPositionX,
            this.startPositionY,
            this.targetPositionX,
            this.targetPositionY,
        );

        if (animation) {
            this.movementDuration = AnimationUtil.calcAnimationDuration(animation, this.movementSpeed, distance);
        } else {
            this.movementDuration = 0;
        }

        this.rotation = rotation * 5;
    }

    protected move(x: number, y: number) {
        if (x === this.positionX && y === this.positionY) return;
        this.positionX = x;
        this.positionY = y;
    }

    protected waitInternal(x: number, y: number) {
        this.positionX = x;
        this.positionY = y;
    }

    stop() {
        this.state = EntityStateEnum.IDLE;
        this.movementDuration = 0;
    }

    publish(eventName, event) {
        this.emitter.emit(eventName, event);
    }

    subscribe(eventName, callback) {
        this.emitter.on(eventName, callback);
    }

    unsubscribe(eventName, callback) {
        this.emitter.off(eventName, callback);
    }

    removeAllListeners(eventName) {
        this.emitter.removeAllListeners(eventName);
    }

    getId() {
        return this.id;
    }
    setId(value: number) {
        this.id = value;
    }
    getMovementDuration() {
        return this.movementDuration;
    }
    setRotation(value: number) {
        this.rotation = value;
    }
    getRotation() {
        return this.rotation;
    }
    getMovementSpeed() {
        return this.movementSpeed;
    }
    setMovementSpeed(value) {
        this.movementSpeed = value;
    }
    getAttackSpeed() {
        return this.attackSpeed;
    }
    setAttackSpeed(value) {
        this.attackSpeed = value;
    }
    getVirtualId() {
        return this.virtualId;
    }
    setVirtualId(value) {
        this.virtualId = value;
    }
    getEntityType() {
        return this.entityType;
    }
    getPositionX() {
        return this.positionX;
    }
    setPositionX(value) {
        this.positionX = value;
    }
    getPositionY() {
        return this.positionY;
    }
    setPositionY(value) {
        this.positionY = value;
    }
    getSt() {
        return this.st;
    }
    getHt() {
        return this.ht;
    }
    getDx() {
        return this.dx;
    }
    getIq() {
        return this.iq;
    }
    setSt(value: number) {
        this.st = value;
    }
    setHt(value: number) {
        this.ht = value;
    }
    setDx(value: number) {
        this.dx = value;
    }
    setIq(value: number) {
        this.iq = value;
    }
    getName() {
        return this.name;
    }
    getLevel() {
        return this.level;
    }
    protected setLevel(value: number) {
        this.level = value;
    }
    getEmpire() {
        return this.empire;
    }
    getClassId() {
        return this.classId;
    }
    getState() {
        return this.state;
    }
    protected setState(value: EntityStateEnum) {
        this.state = value;
    }

    addNearbyEntity(entity: any) {
        if (entity instanceof GameEntity || entity instanceof DroppedItem) {
            this.nearbyEntities.set(entity.getVirtualId(), entity as GameEntity);
        }
    }

    removeNearbyEntity(entity: any) {
        if (entity instanceof GameEntity || entity instanceof DroppedItem) {
            this.nearbyEntities.delete(entity.getVirtualId());
        }
    }

    isNearby(entity: any) {
        if (entity instanceof GameEntity || entity instanceof DroppedItem) {
            return this.nearbyEntities.has(entity.getVirtualId());
        }
    }

    getNearbyEntities() {
        return this.nearbyEntities;
    }
}