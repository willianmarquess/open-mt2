import { EntityStateEnum } from '@/core/enum/EntityStateEnum';
import AnimationManager from '../../manager/AnimationManager';
import { AnimationTypeEnum } from '@/core/enum/AnimationTypeEnum';
import { AnimationSubTypeEnum } from '@/core/enum/AnimationSubTypeEnum';
import MathUtil from '../../util/MathUtil';
import AnimationUtil from '../../util/AnimationUtil';
import type Player from './player/Player';
import GameEntity from './GameEntity';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';
import AffectBitFlag from '@/core/util/AffectBitFlag';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { FlyEnum } from '@/core/enum/FlyEnum';
import { StateMachine } from '@/core/util/StateMachine';
import { PositionEnum } from '@/core/enum/PositionEnum';
import { EmpireEnum } from '@/core/enum/EmpireEnum';
import { QuestManager } from '../../quests/QuestManager';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';
import { MovementTypeEnum } from '@/core/enum/MovementTypeEnum';
import GlobalEventTimerManager from '../../manager/GlobalEventTimeManager';
import { TimedEventsEnum } from '@/core/enum/TimedEventsEnum';

type MovementNodeProvider = () => { x: number; y: number } | null;

const MOVEMENT_NODE_HANDOFF_RATE = 0.9;
const SPEED_REFERENCE_DISTANCE = 10_000;

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
    protected lastMoveTime: number = performance.now();

    protected readonly nearbyEntities = new Map<number, GameEntity>();

    protected target: Character | null = null;
    protected readonly targetedBy = new Map<number, Character>();

    private lastAttackedById: number = 0;
    private lastAttackedTime: number = 0;

    protected readonly affectBitFlag = new AffectBitFlag();
    private readonly activeAffects = new Map<string, { flag: AffectBitsTypeEnum; point?: PointsEnum; value: number }>();
    protected readonly animationManager: AnimationManager;

    protected readonly stateMachine: StateMachine = new StateMachine();
    protected pos: PositionEnum = PositionEnum.STANDING;

    protected readonly questManager: QuestManager;
    private movementNodeProvider: MovementNodeProvider | null = null;
    protected readonly eventTimerManager: GlobalEventTimerManager;

    constructor(
        {
            id,
            classId,
            virtualId,
            entityType,
            positionX,
            positionY,
            name,
            empire,
        }: {
            id: number;
            classId: number;
            virtualId: number;
            entityType: EntityTypeEnum;
            positionX: number;
            positionY: number;
            name: string;
            empire: number;
        },
        {
            animationManager,
            questManager,
            eventTimerManager,
        }: {
            animationManager: AnimationManager;
            questManager: QuestManager;
            eventTimerManager: GlobalEventTimerManager;
        },
    ) {
        super(
            {
                entityType,
                positionX,
                positionY,
                virtualId,
            },
            { eventTimerManager },
        );
        this.id = id;
        this.classId = classId;
        this.name = name;
        this.empire = empire;

        this.animationManager = animationManager;
        this.questManager = questManager;
        this.eventTimerManager = eventTimerManager;
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

    private static affectEventId(flag: AffectBitsTypeEnum, point?: PointsEnum): string {
        return point !== undefined
            ? `AFFECT_${AffectBitsTypeEnum[flag]}_${PointsEnum[point]}`
            : `AFFECT_${AffectBitsTypeEnum[flag]}`;
    }

    /**
     * Generic timed affect: sets the flag, optionally bumps a point, and schedules its own removal
     * after `duration` seconds. Reusable by any system (skills, items, quests) that needs a flagged,
     * timed buff/debuff without hand-rolling the addEventTimer/removeAffectFlag dance (see the manual
     * pattern in PlayerBattleAgainstMobStrategy.applyPoison/applyStun/applySlow).
     *
     * A single flag can carry several independent sub-effects at once (e.g. Strong Body raises both
     * DEFENSE_GRADE and MOVE_SPEED under AffectBitsTypeEnum.STRONG_BODY) - each is tracked by its own
     * flag+point key, so adding one never reverts another already active under the same flag. Calling
     * this again for the *same* flag+point refreshes that one sub-effect (removes then reapplies).
     */
    addAffect({
        flag,
        point,
        value = 0,
        duration,
        eventId = Character.affectEventId(flag, point),
    }: {
        flag: AffectBitsTypeEnum;
        point?: PointsEnum;
        value?: number;
        duration: number;
        eventId?: string;
    }) {
        if (this.activeAffects.has(eventId)) {
            this.removeAffectEntry(eventId);
        }

        this.setAffectFlag(flag);
        this.activeAffects.set(eventId, { flag, point, value });

        // Entering stealth drops whoever was actively locked onto me - they can't keep fighting a
        // target they can no longer see. Mirrors GetNearestVictim/battle_is_attackable treating an
        // invisible character as unpickable (char_battle.cpp:3060-3063), generalized to also clear
        // locks that already existed before I vanished.
        if (flag === AffectBitsTypeEnum.STEALTH) {
            this.clearTargetedBy();
        }

        if (point !== undefined && value !== 0) {
            this.addPoint(point, value);
        }

        if (duration > 0) {
            this.addEventTimer({
                id: eventId,
                eventFunction: () => {
                    // intentional no-op: this affect only reacts to its own expiration
                },
                options: { interval: duration * 1000, duration: duration * 1000, repeatCount: 1 },
                onEndEventFunction: () => this.removeAffectEntry(eventId),
            });
        }

        this.onAffectAdded(flag, point, value, duration);
    }

    removeAffect(flag: AffectBitsTypeEnum, eventId?: string) {
        if (eventId !== undefined) {
            this.removeAffectEntry(eventId);
            return;
        }

        if (!this.isAffectByFlag(flag)) return;

        for (const [id, entry] of [...this.activeAffects.entries()]) {
            if (entry.flag === flag) this.removeAffectEntry(id);
        }
    }

    private removeAffectEntry(eventId: string) {
        const entry = this.activeAffects.get(eventId);
        if (!entry) return;

        this.activeAffects.delete(eventId);
        this.removeEventTimer(eventId);

        if (entry.point !== undefined && entry.value !== 0) {
            this.addPoint(entry.point, -entry.value);
        }

        const stillActive = [...this.activeAffects.values()].some((other) => other.flag === entry.flag);
        if (!stillActive) {
            this.removeAffectFlag(entry.flag);
        }

        this.onAffectRemoved(entry.flag, entry.point);
    }

    /** Hook for subclasses that can notify a client (Player) when a timed affect starts/ends. No-op by default (e.g. Monster has no UI to update here). */

    protected onAffectAdded(
        _flag: AffectBitsTypeEnum,
        _point: PointsEnum | undefined,
        _value: number,
        _duration: number,
    ): void {
        // intentional no-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected onAffectRemoved(_flag: AffectBitsTypeEnum, _point: PointsEnum | undefined): void {
        // intentional no-op
    }

    removeBadAffects() {
        if (this.isAffectByFlag(AffectBitsTypeEnum.POISON)) {
            this.removeAffectFlag(AffectBitsTypeEnum.POISON);
            this.removeEventTimer(TimedEventsEnum.POISON);
        }

        if (this.isAffectByFlag(AffectBitsTypeEnum.STUN)) {
            this.removeStun();
            this.removeEventTimer(TimedEventsEnum.STUN);
        }

        if (this.isAffectByFlag(AffectBitsTypeEnum.FIRE)) {
            this.removeAffectFlag(AffectBitsTypeEnum.FIRE);
            this.removeEventTimer(TimedEventsEnum.FIRE);
        }
    }

    private static readonly GOOD_AFFECT_FLAGS: readonly AffectBitsTypeEnum[] = [
        AffectBitsTypeEnum.MOV_SPEED_POTION,
        AffectBitsTypeEnum.ATT_SPEED_POTION,
        AffectBitsTypeEnum.CHINA_FIREWORK,
        AffectBitsTypeEnum.BERSERK,
        AffectBitsTypeEnum.AURA_OF_SWORD,
        AffectBitsTypeEnum.STRONG_BODY,
        AffectBitsTypeEnum.STRONG_BODY_WITH_FALL,
        AffectBitsTypeEnum.FEATHER_WALK,
        AffectBitsTypeEnum.STEALTH,
        AffectBitsTypeEnum.ENCHANTED_BLADE,
        AffectBitsTypeEnum.ENCHANTED_ARMOUR,
        AffectBitsTypeEnum.MANASHIELD,
        AffectBitsTypeEnum.REFLECT,
        AffectBitsTypeEnum.SWIFTNESS,
        AffectBitsTypeEnum.TERROR,
    ];

    removeGoodAffects() {
        for (const flag of Character.GOOD_AFFECT_FLAGS) {
            this.removeAffect(flag);
        }
    }

    getAttackRating() {
        return Math.min(90, (this.getPoint(PointsEnum.DX) * 4 + this.getPoint(PointsEnum.LEVEL) * 2) / 6);
    }

    abstract getHealthPercentage(): number;
    abstract getAttack(): number;
    abstract getDefense(): number;

    public createFlyEffect(toVirtualId: number, type: FlyEnum) {
        if (this.isPlayer()) {
            this.showFlyEffect(type, this.virtualId, toVirtualId);
        }

        for (const otherEntity of this.nearbyEntities.values()) {
            if (otherEntity.isPlayer()) {
                (otherEntity as Player).showFlyEffect(type, this.virtualId, toVirtualId);
            }
        }
    }

    public createFlyTargeting({
        target,
        positionX = 0,
        positionY = 0,
        isAdd = false,
    }: {
        target?: Character;
        positionX?: number;
        positionY?: number;
        isAdd?: boolean;
    }) {
        for (const otherEntity of this.nearbyEntities.values()) {
            if (otherEntity.isPlayer()) {
                (otherEntity as Player).showFlyTargeting({
                    shooterVirtualId: this.virtualId,
                    targetVirtualId: target?.getVirtualId() ?? 0,
                    positionX: target ? target.getPositionX() : positionX,
                    positionY: target ? target.getPositionY() : positionY,
                    isAdd,
                });
            }
        }
    }

    setPos(pos: PositionEnum) {
        this.pos = pos;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    die(_killer?: Character) {
        this.pos = PositionEnum.DEAD;
        this.removeTimers();
    }

    isDead(): boolean {
        return this.pos === PositionEnum.DEAD;
    }

    removeTarget(): void {
        this.target = null;
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

    clearTargetedBy() {
        for (const attacker of this.targetedBy.values()) {
            attacker.removeTarget();
        }
        this.targetedBy.clear();
    }

    addTargetedBy(entity: Character) {
        this.targetedBy.set(entity.virtualId, entity);
    }

    wasAttackedRecentlyBy(attackerId: number, within: number, now: number) {
        return this.lastAttackedById === attackerId && now - this.lastAttackedTime < within;
    }

    recordAttackedBy(attackerId: number, now: number) {
        this.lastAttackedById = attackerId;
        this.lastAttackedTime = now;
    }

    broadcastMyTarget() {
        for (const entity of this.targetedBy.values()) {
            if (entity.isPlayer()) {
                (entity as Player).sendTargetUpdated(this);
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
        this.onMove();
        this.stateMachine.gotoState(EntityStateEnum.MOVING);
    }

    /** Move an NPC or character and broadcast the movement to nearby players. */
    moveTo(x: number, y: number): void {
        this.movementNodeProvider = null;
        const rotation = MathUtil.calcRotationFromXY(x - this.positionX, y - this.positionY) / 5;
        this.gotoInternal(x, y, rotation);
        this.broadcastMovement(x, y, rotation);
    }

    moveAlongNodes(provider: MovementNodeProvider): void {
        this.movementNodeProvider = provider;
        this.startNextMovementNode();
    }

    continueMovementNodes(): void {
        if (this.movementNodeProvider && this.getState() === EntityStateEnum.IDLE) {
            this.startNextMovementNode();
        }
    }

    clearMovementNodes(): void {
        this.movementNodeProvider = null;
        this.stateMachine.gotoState(EntityStateEnum.IDLE);
    }

    private startNextMovementNode(): void {
        const node = this.movementNodeProvider?.();
        if (!node) {
            this.stateMachine.gotoState(EntityStateEnum.IDLE);
            return;
        }

        const rotation = MathUtil.calcRotationFromXY(node.x - this.positionX, node.y - this.positionY) / 5;
        this.gotoInternal(node.x, node.y, rotation);
        this.broadcastMovementMoving(node.x, node.y, rotation);
    }

    private broadcastMovementMoving(positionX: number, positionY: number, rotation: number): void {
        this.area?.onCharacterMove({
            entity: this,
            params: {
                positionX,
                positionY,
                arg: 0,
                rotation,
                time: performance.now(),
                movementType: MovementTypeEnum.MOVE,
                duration: 10,
            },
        });
    }

    private broadcastMovement(positionX: number, positionY: number, rotation: number): void {
        this.area?.onCharacterMove({
            entity: this,
            params: {
                positionX,
                positionY,
                arg: 0,
                rotation,
                time: performance.now(),
                movementType: MovementTypeEnum.WAIT,
                duration: this.movementDuration,
            },
        });
    }

    protected move(x: number, y: number) {
        if (x === this.positionX && y === this.positionY) return;
        this.positionX = x;
        this.positionY = y;
    }

    protected stun() {
        if (this.targetPositionX === this.positionX && this.targetPositionY === this.positionY) return;

        this.startPositionX = this.targetPositionX = this.positionX;
        this.startPositionY = this.targetPositionY = this.positionY;

        if (this.pos === PositionEnum.FIGHTING) {
            this.setPos(PositionEnum.STANDING);
        }

        this.syncPosition();
    }

    protected syncPosition() {
        for (const entity of this.nearbyEntities.values()) {
            if (entity.isPlayer()) {
                entity.sendSyncPosition(this);
            }
        }

        if (this.isPlayer()) {
            this.sendSyncPosition(this);
        }
    }

    protected removeStun() {
        this.removeAffectFlag(AffectBitsTypeEnum.STUN);
    }

    protected waitInternal(x: number, y: number) {
        this.positionX = this.startPositionX = this.targetPositionX = x;
        this.positionY = this.startPositionY = this.targetPositionY = y;
        this.setRotation(MathUtil.calcRotationFromXY(x, y));
        this.onMove();
        this.stateMachine.gotoState(EntityStateEnum.IDLE);
    }

    stop() {
        this.stateMachine.gotoState(EntityStateEnum.IDLE);
    }

    /** Mirrors the original's OnMove(): moving and attacking both refresh this. */
    protected onMove() {
        this.lastMoveTime = performance.now();
    }

    getLastMoveTime() {
        return this.lastMoveTime;
    }

    getMovementSpeed() {
        return this.getPoint(PointsEnum.MOVE_SPEED);
    }

    /** Null when the class has no run animation, the case gotoInternal() also gives no duration. */
    getMoveDistancePerMs(): number | null {
        const animation = this.animationManager.getAnimation(
            String(this.classId),
            AnimationTypeEnum.RUN,
            AnimationSubTypeEnum.GENERAL,
        );

        if (!animation) return null;

        const duration = AnimationUtil.calcAnimationDuration(
            animation,
            this.getPoint(PointsEnum.MOVE_SPEED),
            SPEED_REFERENCE_DISTANCE,
        );

        return duration > 0 ? SPEED_REFERENCE_DISTANCE / duration : null;
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

    protected idleStateTick() {
        // intentional no-op: subclasses override this state hook when idle behavior is needed
    }

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

        if (rate >= MOVEMENT_NODE_HANDOFF_RATE && this.movementNodeProvider) {
            const node = this.movementNodeProvider();
            if (node) {
                this.startMovementNode(node);
                return;
            }
        }

        if (rate >= 1) {
            if (this.movementNodeProvider) {
                this.startNextMovementNode();
            } else {
                this.stateMachine.gotoState(EntityStateEnum.IDLE);
            }
        }
    }

    private startMovementNode(node: { x: number; y: number }): void {
        const rotation = MathUtil.calcRotationFromXY(node.x - this.positionX, node.y - this.positionY) / 5;
        this.gotoInternal(node.x, node.y, rotation);
        this.broadcastMovement(node.x, node.y, rotation);
    }
}
