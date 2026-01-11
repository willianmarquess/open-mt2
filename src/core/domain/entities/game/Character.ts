import { EntityStateEnum } from '@/core/enum/EntityStateEnum';
import AnimationManager from '../../manager/AnimationManager';
import { AnimationTypeEnum } from '@/core/enum/AnimationTypeEnum';
import { AnimationSubTypeEnum } from '@/core/enum/AnimationSubTypeEnum';
import MathUtil from '../../util/MathUtil';
import AnimationUtil from '../../util/AnimationUtil';
import Player from './player/Player';
import GameEntity from './GameEntity';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';
import AffectBitFlag from '@/core/util/AffectBitFlag';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { FlyEnum } from '@/core/enum/FlyEnum';
import { StateMachine } from '@/core/util/StateMachine';
import { PositionEnum } from '@/core/enum/PositionEnum';
import { EmpireEnum } from '@/core/enum/EmpireEnum';

export default abstract class Character extends GameEntity {
    protected id: number;
    protected classId: number = 0;
    protected name: string;
    protected empire: number;

    //movement and animation
    protected rotation: number = 0;
    protected startPositionX: number = 0;
    protected startPositionY: number = 0;
    protected movementStart: number = 0;
    protected movementDuration: number = 0;

    protected readonly nearbyEntities = new Map<number, GameEntity>();

    protected target: Character;
    protected readonly targetedBy = new Map<number, Character>();

    protected readonly affectBitFlag = new AffectBitFlag();
    protected readonly animationManager: AnimationManager;

    protected readonly stateMachine: StateMachine = new StateMachine();
    protected pos: PositionEnum = PositionEnum.STANDING;

    constructor({ id, classId, virtualId, entityType, positionX, positionY, name, empire }, { animationManager }) {
        super({
            entityType,
            positionX,
            positionY,
            virtualId,
        });
        this.id = id;
        this.classId = classId;
        this.name = name;
        this.empire = empire;

        this.animationManager = animationManager;
    }

    abstract addPoint(point: PointsEnum, value: number): void;
    abstract setPoint(point: PointsEnum, value: number): void;
    abstract getPoint(point: PointsEnum): number;

    getAffectFlags() {
        return this.affectBitFlag.getFlags();
    }

    isAffectByFlag(value: AffectBitsTypeEnum) {
        return this.affectBitFlag.isSet(value);
    }

    setAffectFlag(value: AffectBitsTypeEnum) {
        this.affectBitFlag.set(value);
    }

    removeAffectFlag(value: AffectBitsTypeEnum) {
        this.affectBitFlag.reset(value);
    }

    getAttackRating() {
        return Math.min(90, this.getPoint(PointsEnum.DX) * 4 + (this.getPoint(PointsEnum.LEVEL) * 2) / 6);
    }

    abstract getHealthPercentage(): number;
    abstract getAttack(): number;
    abstract getDefense(): number;

    public createFlyEffect(toVirtualId: number, type: FlyEnum) {
        for (const otherEntity of this.nearbyEntities.values()) {
            if (otherEntity instanceof Player) {
                otherEntity.showFlyEffect(type, this.virtualId, toVirtualId);
            }
        }
    }

    setPos(pos: PositionEnum) {
        this.pos = pos;
    }

    // eslint-disable-next-line
    die(_killer?: Character) {
        this.pos = PositionEnum.DEAD;
        this.eventTimerManager.clearAllTimers();
    }

    isDead(): boolean {
        return this.pos === PositionEnum.DEAD;
    }

    removeTarget(): void {
        this.setTarget(undefined);
    }

    getTarget() {
        return this.target;
    }

    setTarget(target: Character) {
        if (this.target) {
            this.target.removeTargetedBy(this);
        }
        this.target = target;
        target?.addTargetedBy(this);
    }

    removeTargetedBy(entity: Character) {
        this.targetedBy.delete(entity.virtualId);
    }

    addTargetedBy(entity: Character) {
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
        this.stateMachine.tick();
    }

    protected gotoInternal(x: number, y: number, rotation: number) {
        if (x === this.positionX && y === this.positionY) return;
        if (x === this.targetPositionX && y === this.targetPositionY) return;

        const animation = this.animationManager.getAnimation(
            String(this.classId),
            AnimationTypeEnum.RUN,
            AnimationSubTypeEnum.GENERAL,
        );

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
            this.movementDuration = AnimationUtil.calcAnimationDuration(
                animation,
                this.getPoint(PointsEnum.MOVE_SPEED),
                distance,
            );
        } else {
            this.movementDuration = 0;
        }

        this.rotation = rotation * 5;
        this.stateMachine.gotoState(EntityStateEnum.MOVING);
    }

    protected move(x: number, y: number) {
        if (x === this.positionX && y === this.positionY) return;
        this.positionX = x;
        this.positionY = y;
    }

    protected stun() {
        //TODO: verify the necessity to send sync packet
        if (this.targetPositionX === this.positionX || this.targetPositionY === this.positionY) {
            this.startPositionX = this.targetPositionX = this.positionX;
            this.startPositionY = this.targetPositionY = this.positionY;
            if (this.pos === PositionEnum.FIGHTING) {
                this.setPos(PositionEnum.STANDING);
            }
        }
    }

    protected removeStun() {
        this.removeAffectFlag(AffectBitsTypeEnum.STUN);
    }

    protected waitInternal(x: number, y: number) {
        this.positionX = this.startPositionX = this.targetPositionX = x;
        this.positionY = this.startPositionY = this.targetPositionY = y;
        this.setRotation(MathUtil.calcRotationFromXY(x, y));
        this.stateMachine.gotoState(EntityStateEnum.IDLE);
    }

    stop() {
        this.stateMachine.gotoState(EntityStateEnum.IDLE);
    }

    getMovementSpeed() {
        return this.getPoint(PointsEnum.MOVE_SPEED);
    }

    getAttackSpeed() {
        return this.getPoint(PointsEnum.ATTACK_SPEED);
    }

    getLevel() {
        return this.getPoint(PointsEnum.LEVEL);
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

    getName() {
        return this.name;
    }

    getEmpire(): number {
        return this.empire;
    }

    isFromShinsu(): boolean {
        return this.empire === EmpireEnum.RED;
    }

    isFromChunjo(): boolean {
        return this.empire === EmpireEnum.YELLOW;
    }

    isFromJinno(): boolean {
        return this.empire === EmpireEnum.BLUE;
    }

    getClassId() {
        return this.classId;
    }

    getState() {
        return this.stateMachine.getCurrentStateName();
    }

    addNearbyEntity(entity: GameEntity) {
        this.nearbyEntities.set(entity.getVirtualId(), entity);
    }

    removeNearbyEntity(entity: GameEntity) {
        this.nearbyEntities.delete(entity.getVirtualId());
    }

    isNearby(entity: GameEntity) {
        return this.nearbyEntities.has(entity.getVirtualId());
    }

    getNearbyEntities() {
        return this.nearbyEntities;
    }

    /**
     * STATE MANAGEMENT
     */

    protected idleStateStart() {
        this.movementDuration = 0;
    }

    protected idleStateTick() {}

    protected movingStateTick() {
        if (this.isDead()) return;
        if (this.isAffectByFlag(AffectBitsTypeEnum.STUN)) return;

        const elapsed = performance.now() - this.movementStart;
        let rate = this.movementDuration == 0 ? 1 : elapsed / this.movementDuration;
        if (rate > 1) rate = 1;

        const x = (this.targetPositionX - this.startPositionX) * rate + this.startPositionX;
        const y = (this.targetPositionY - this.startPositionY) * rate + this.startPositionY;

        this.positionX = x;
        this.positionY = y;

        if (rate >= 1) {
            this.stateMachine.gotoState(EntityStateEnum.IDLE);
        }
    }
}
