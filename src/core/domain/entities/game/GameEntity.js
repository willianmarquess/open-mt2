import { EventEmitter } from 'node:events';
import AnimationUtil from '../../util/AnimationUtil.js';
import EntityStateEnum from '../../../enum/EntityStateEnum.js';
import AnimationTypeEnum from '../../../enum/AnimationTypeEnum.js';
import AnimationSubTypeEnum from '../../../enum/AnimationSubTypeEnum.js';
import MathUtil from '../../util/MathUtil.js';

export default class GameEntity {
    #id;
    #virtualId;
    #entityType;
    #classId = 0;
    #name;
    #level;
    #empire;

    //movement and animation
    #positionX = 0;
    #positionY = 0;
    #rotation = 0;
    #targetPositionX = 0;
    #targetPositionY = 0;
    #startPositionX = 0;
    #startPositionY = 0;
    #state = EntityStateEnum.IDLE;
    #movementStart = 0;
    #movementDuration = 0;
    #movementSpeed = 0;
    #attackSpeed = 0;

    #st;
    #dx;
    #ht;
    #iq;

    #animationManager;
    #emitter = new EventEmitter();
    #nearbyEntities = new Map();

    #target;
    #targetedBy = new Map();

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
        this.#id = id;
        this.#classId = classId;
        this.#virtualId = virtualId;
        this.#entityType = entityType;
        this.#positionX = positionX;
        this.#positionY = positionY;
        this.#movementSpeed = movementSpeed;
        this.#attackSpeed = attackSpeed;
        this.#st = st;
        this.#dx = dx;
        this.#ht = ht;
        this.#iq = iq;
        this.#name = name;
        this.#level = level;
        this.#empire = empire;

        this.#animationManager = animationManager;
    }

    getAttackRating() {
        return Math.min(90, this.dx * 4 + (this.level * 2) / 6);
    }

    getHealthPercentage() {
        throw new Error('this method must be overwritten');
    }

    getAttack() {
        throw new Error('this method must be overwritten');
    }

    getDefense() {
        throw new Error('this method must be overwritten');
    }

    attack() {
        throw new Error('this method must be overwritten');
    }

    damage() {
        throw new Error('this method must be overwritten');
    }

    die() {
        this.state = EntityStateEnum.DEAD;
    }

    setTarget(target) {
        if (target instanceof GameEntity) {
            if (this.#target) {
                this.#target.removeTargetedBy(this);
            }
            this.#target = target;
            target.addTargetedBy(this);
        }
    }

    removeTargetedBy(entity) {
        this.#targetedBy.delete(entity.virtualId);
    }

    addTargetedBy(entity) {
        this.#targetedBy.set(entity.virtualId, entity);
    }

    broadcastMyTarget() {
        for (const entity of this.#targetedBy.values()) {
            entity.sendTargetUpdated(this);
        }
    }

    tick() {
        if (this.#state == EntityStateEnum.MOVING) {
            const elapsed = performance.now() - this.#movementStart;
            let rate = this.#movementDuration == 0 ? 1 : elapsed / this.#movementDuration;
            if (rate > 1) rate = 1;

            const x = (this.#targetPositionX - this.#startPositionX) * rate + this.#startPositionX;
            const y = (this.#targetPositionY - this.#startPositionY) * rate + this.#startPositionY;

            this.#positionX = x;
            this.#positionY = y;

            if (rate >= 1) {
                this.#state = EntityStateEnum.IDLE;
            }
        }
    }

    goto(x, y, rotation) {
        if (x === this.#positionX && y === this.#positionY) return;
        if (x === this.#targetPositionX && y === this.#targetPositionY) return;

        const animation = this.#animationManager.getAnimation(
            this.#classId,
            AnimationTypeEnum.RUN,
            AnimationSubTypeEnum.GENERAL,
        );

        this.#state = EntityStateEnum.MOVING;
        this.#targetPositionX = x;
        this.#targetPositionY = y;
        this.#startPositionX = this.positionX;
        this.#startPositionY = this.positionY;
        this.#movementStart = performance.now();

        const distance = MathUtil.calcDistance(
            this.#startPositionX,
            this.#startPositionY,
            this.#targetPositionX,
            this.#targetPositionY,
        );

        if (animation) {
            this.#movementDuration = AnimationUtil.calcAnimationDuration(animation, this.#movementSpeed, distance);
        } else {
            this.#movementDuration = 0;
        }

        this.#rotation = rotation * 5;
    }

    move(x, y) {
        if (x === this.#positionX && y === this.#positionY) return;
        this.#positionX = x;
        this.#positionY = y;
    }

    wait(x, y) {
        this.#positionX = x;
        this.#positionY = y;
    }

    stop() {
        this.#state = EntityStateEnum.IDLE;
        this.#movementDuration = 0;
    }

    publish(eventName, event) {
        this.#emitter.emit(eventName, event);
    }

    subscribe(eventName, callback) {
        this.#emitter.on(eventName, callback);
    }

    unsubscribe(eventName, callback) {
        this.#emitter.off(eventName, callback);
    }

    removeAllListeners(eventName) {
        this.#emitter.removeAllListeners(eventName);
    }

    get id() {
        return this.#id;
    }
    set id(value) {
        this.#id = value;
    }
    get movementDuration() {
        return this.#movementDuration;
    }
    set rotation(value) {
        this.#rotation = value;
    }
    get rotation() {
        return this.#rotation;
    }
    get movementSpeed() {
        return this.#movementSpeed;
    }
    set movementSpeed(value) {
        this.#movementSpeed = value;
    }
    get attackSpeed() {
        return this.#attackSpeed;
    }
    set attackSpeed(value) {
        this.#attackSpeed = value;
    }
    get virtualId() {
        return this.#virtualId;
    }
    set virtualId(value) {
        this.#virtualId = value;
    }
    get entityType() {
        return this.#entityType;
    }
    get positionX() {
        return this.#positionX;
    }
    set positionX(value) {
        this.#positionX = value;
    }
    get positionY() {
        return this.#positionY;
    }
    set positionY(value) {
        this.#positionY = value;
    }
    get st() {
        return this.#st;
    }
    get ht() {
        return this.#ht;
    }
    get dx() {
        return this.#dx;
    }
    get iq() {
        return this.#iq;
    }
    set st(value) {
        this.#st = value;
    }
    set ht(value) {
        this.#ht = value;
    }
    set dx(value) {
        this.#dx = value;
    }
    set iq(value) {
        this.#iq = value;
    }
    get name() {
        return this.#name;
    }
    get level() {
        return this.#level;
    }
    set level(value) {
        this.#level = value;
    }
    get empire() {
        return this.#empire;
    }
    get classId() {
        return this.#classId;
    }
    get state() {
        return this.#state;
    }
    set state(value) {
        this.#state = value;
    }

    addNearbyEntity(entity) {
        if (entity instanceof GameEntity) {
            this.#nearbyEntities.set(entity.virtualId, entity);
        }
    }

    removeNearbyEntity(entity) {
        if (entity instanceof GameEntity) {
            this.#nearbyEntities.delete(entity.virtualId);
        }
    }

    isNearby(entity) {
        if (entity instanceof GameEntity) {
            return this.#nearbyEntities.has(entity.virtualId);
        }
    }

    get nearbyEntities() {
        return this.#nearbyEntities;
    }
}
