import { EntityStateEnum } from '@/core/enum/EntityStateEnum';
import MathUtil from '../../../util/MathUtil';
import Monster from '@/core/domain/entities/game/mob/Monster';
import Player from '../player/Player';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';
import { PositionEnum } from '@/core/enum/PositionEnum';

const POSITION_OFFSET = 600;
const MIN_DELAY = 15000;
const MAX_DELAY = 25000;
const MAX_TIME_WITHOUT_ATTACK = 15_000;
const MAX_DISTANCE_WITHOUT_ATTACK = 5_000;
const BASE_NEXT_TIME_TO_ATTACK = 2_000;
const MIN_NEXT_TIME_TO_ATTACK = 1_000;
const MIN_NEXT_TIME_TO_MOVE = 500;

type DamageMapType = {
    player: Player;
    damage: number;
};

export default class Behavior {
    private readonly monster: Monster;
    private initialPositionX: number = 0;
    private initialPositionY: number = 0;
    private nextMove: number = this.calcDelay();
    private enable: boolean = false;
    private nextAttackTime: number = 0;
    private lastAttackTime: number = 0;
    private lastChangeAttackPositionTime: number = 0;
    private nextMoveTime: number = 0;
    private lastAttackPositionX: number = 0;
    private lastAttackPositionY: number = 0;

    private readonly damageMap: Map<number, DamageMapType> = new Map();
    private target: Player;

    constructor(monster: Monster) {
        this.monster = monster;
    }

    init() {
        this.initialPositionX = this.monster.getPositionX();
        this.initialPositionY = this.monster.getPositionY();
        this.nextMove = this.calcDelay();
        this.enable = true;
    }

    private getDistanceFromTarget() {
        return this.getDistance(this.target.getPositionX(), this.target.getPositionY());
    }

    private getDistance(x: number, y: number) {
        return MathUtil.calcDistance(this.monster.getPositionX(), this.monster.getPositionY(), x, y);
    }

    private moveToOriginalPosition() {
        this.target = undefined;
        this.lastAttackTime = undefined;
        this.damageMap.clear();
        this.monster.goto(this.lastAttackPositionX, this.lastAttackPositionY);
    }

    battleState() {
        if (!this.enable) return;
        if (this.monster.isDead()) return;
        if (this.monster.isAffectByFlag(AffectBitsTypeEnum.STUN)) return;

        if (!this.target) return; //TODO: goto idle state

        if (this.target.isDead()) {
            this.damageMap.delete(this.target.getVirtualId());
            //TODO: next target
            return;
        }

        const now = performance.now();

        const distanceFromTarget = this.getDistanceFromTarget();

        if (distanceFromTarget > this.monster.getAttackRange() * 1.15) {
            if (this.nextMoveTime <= now) {
                this.followTarget();
                this.nextMoveTime = now + MIN_NEXT_TIME_TO_MOVE; //move each ~500ms
            }
            return;
        }

        if (this.nextAttackTime <= now) {
            this.attack();
            const attackSpeed = Math.max(1, this.monster.getAttackSpeed());
            const nextAttackDelay = Math.max(MIN_NEXT_TIME_TO_ATTACK, BASE_NEXT_TIME_TO_ATTACK / (attackSpeed / 100));
            this.nextAttackTime = now + nextAttackDelay;
            this.lastAttackTime = now;
            this.lastAttackPositionX = this.monster.getPositionX();
            this.lastAttackPositionY = this.monster.getPositionY();
        }
    }

    movingState() {
        if (!this.enable) return;
        if (this.monster.isDead()) return;
        if (this.monster.isAffectByFlag(AffectBitsTypeEnum.STUN)) return;

        if (this.target) {
            const now = performance.now();

            if (this.lastAttackTime) {
                const tooMuchTimeWithoutAttack = this.lastAttackTime + MAX_TIME_WITHOUT_ATTACK <= now;
                const tooFar =
                    this.getDistance(this.lastAttackPositionX, this.lastAttackPositionY) >= MAX_DISTANCE_WITHOUT_ATTACK;

                if (tooMuchTimeWithoutAttack || tooFar) {
                    this.moveToOriginalPosition();
                    return;
                }
            }

            const distanceFromTarget = this.getDistanceFromTarget();
            if (distanceFromTarget >= this.monster.getAttackRange() * 1.15) {
                if (this.nextMoveTime <= now) {
                    this.followTarget();
                    this.nextMoveTime = now;
                    this.nextMoveTime += MIN_NEXT_TIME_TO_MOVE; //move each ~500ms
                }
            }
        }
    }

    idleState() {
        if (!this.enable) return;
        if (this.monster.isDead()) return;
        if (this.monster.isAffectByFlag(AffectBitsTypeEnum.STUN)) return;

        if (this.target) {
            this.monster.setPos(PositionEnum.FIGHTING);
            return;
        }

        const now = performance.now();
        if (now >= this.nextMove) {
            this.moveToRandomLocation();
            this.nextMove = this.calcDelay();
        }
    }

    private attack() {
        console.log(
            this.monster.getFolder(),
            this.monster.getVirtualId(),
            'iam attacking the target: ',
            this.target.getName(),
        );

        const rotation = MathUtil.calcRotationFromXY(
            this.target.getPositionX() - this.monster.getPositionX(),
            this.target.getPositionY() - this.monster.getPositionY(),
        );
        this.monster.setRotation(rotation);
        this.monster.attack(this.target);
    }

    private calcDelay() {
        return performance.now() + MathUtil.getRandomInt(MIN_DELAY, MAX_DELAY);
    }

    onDamage(attacker: Player, damage: number) {
        const damageMapItem = this.damageMap.get(attacker.getVirtualId());
        this.damageMap.set(attacker.getVirtualId(), {
            damage: (damageMapItem?.damage || 0) + damage,
            player: attacker,
        });

        if (
            !this.target ||
            this.damageMap.get(attacker.getVirtualId()) > this.damageMap.get(this.target.getVirtualId())
        ) {
            this.target = attacker;
        }
    }

    getTargets() {
        return this.damageMap;
    }

    getTarget() {
        return this.target;
    }

    setTarget(target?: Player) {
        this.target = target;
    }

    private changeAttackPosition({
        targetX,
        targetY,
        monsterX,
        monsterY,
        minDistance,
    }: {
        targetX: number;
        targetY: number;
        monsterX: number;
        monsterY: number;
        minDistance: number;
    }) {
        this.lastChangeAttackPositionTime = performance.now();
        const CLOSE_DISTANCE_TO_TURN_90_DEGREES = 500;
        const distance: number = MathUtil.distanceSQRT(targetX - monsterX, targetY - monsterY);

        let fx: number, fy: number;
        const rot = MathUtil.getDegreeFromPositionXY(targetX, targetY, monsterX, monsterY);

        if (distance < CLOSE_DISTANCE_TO_TURN_90_DEGREES) {
            const { dx, dy } = MathUtil.getDeltaByDegree(
                (rot + MathUtil.getRandomInt(-90, 90) + MathUtil.getRandomInt(-90, 90)) % 360,
                minDistance,
            );
            fx = dx;
            fy = dy;
        } else {
            const { dx, dy } = MathUtil.getDeltaByDegree(MathUtil.getRandomInt(0, 359), minDistance);
            fx = dx;
            fy = dy;
        }

        //TODO: we should implement map coordinates attributes to validate if the position is valid (not blocked or object)
        //TODO: implement retries when implement map coord validation

        return {
            dx: targetX + fx,
            dy: targetY + fy,
        };
    }

    private shouldChangeAttackPosition() {
        let changeTime = 5_000;

        if (this.getDistanceFromTarget() > this.monster.getAttackRange() + 100) {
            changeTime = 1_000;
        }

        return performance.now() - this.lastChangeAttackPositionTime > changeTime;
    }

    private predictTargetMovement(targetX: number, targetY: number, monsterX: number, monsterY: number) {
        const targetRotation = this.target.getRotation();
        const rotationDelta = MathUtil.getDegreeDelta(
            targetRotation,
            MathUtil.getDegreeFromPositionXY(monsterX, monsterY, targetX, targetY),
        );

        const targetSpeed = this.target.getMovementSpeed();
        const monsterSpeed = this.monster.getMovementSpeed();
        const distance = MathUtil.distanceSQRT(targetX - monsterX, targetY - monsterY);
        const followSpeed = monsterSpeed - targetSpeed * Math.cos((rotationDelta * Math.PI) / 180);

        if (followSpeed >= 0.1) {
            const meetTime = distance / followSpeed;

            if (meetTime * targetSpeed <= 1_00000) {
                const { dx: yourMoveEstimateX, dy: yourMoveEstimateY } = MathUtil.getDeltaByDegree(
                    this.target.getRotation(),
                    meetTime * targetSpeed,
                );

                targetX += yourMoveEstimateX;
                targetY += yourMoveEstimateY;

                const newDistance = Math.sqrt(
                    (targetX - monsterX) * (targetX - monsterX) + (targetY - monsterY) * (targetY - monsterY),
                );

                if (distance < newDistance) {
                    targetX = monsterX + ((targetX - monsterX) * distance) / newDistance;
                    targetY = monsterY + ((targetY - monsterY) * distance) / newDistance;
                }
            }
        }

        return {
            x: targetX,
            y: targetY,
        };
    }

    private followTarget() {
        let targetX = this.target.getPositionX();
        let targetY = this.target.getPositionY();
        const monsterX = this.monster.getPositionX();
        const monsterY = this.monster.getPositionY();
        const minDistance = this.monster.getAttackRange() * 0.9; //90%

        const shouldPredictTargetMovement = this.target.getState() === EntityStateEnum.MOVING;

        if (shouldPredictTargetMovement) {
            const { x, y } = this.predictTargetMovement(targetX, targetY, monsterX, monsterY);
            targetX = x;
            targetY = y;
        }

        this.monster.setRotation(MathUtil.getDegreeFromPositionXY(monsterX, monsterY, targetX, targetY));

        const distance: number = MathUtil.distanceSQRT(targetX - monsterX, targetY - monsterY);

        if (distance <= minDistance) return;

        if (this.shouldChangeAttackPosition()) {
            const { dx, dy } = this.changeAttackPosition({
                targetX,
                targetY,
                monsterX,
                monsterY,
                minDistance,
            });
            this.monster.goto(dx, dy);
            return;
        }

        const distanceToGo = distance - minDistance;
        const { dx, dy } = MathUtil.getDeltaByDegree(this.monster.getRotation(), distanceToGo);

        this.monster.goto(monsterX + dx, monsterY + dy);
    }

    private moveToRandomLocation() {
        const x = Math.max(
            0,
            Math.min(
                MathUtil.MAX_UINT,
                this.initialPositionX + MathUtil.getRandomInt(-POSITION_OFFSET, POSITION_OFFSET),
            ),
        );
        const y = Math.max(
            0,
            Math.min(
                MathUtil.MAX_UINT,
                this.initialPositionY + MathUtil.getRandomInt(-POSITION_OFFSET, POSITION_OFFSET),
            ),
        );

        this.monster.goto(x, y);
    }
}
