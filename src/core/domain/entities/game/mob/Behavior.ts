import { EntityStateEnum } from '@/core/enum/EntityStateEnum';
import MathUtil from '../../../util/MathUtil';
import Monster from '@/core/domain/entities/game/mob/Monster';
import Player from '../player/Player';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';

const POSITION_OFFSET = 600;
const MIN_DELAY = 15000;
const MAX_DELAY = 25000;
const MAX_TIME_WITHOUT_ATTACK = 15_000;
const MAX_DISTANCE_WITHOUT_ATTACK = 5_000;
const BASE_NEXT_TIME_TO_ATTACK = 2_000;
const MIN_NEXT_TIME_TO_ATTACK = 1_000;
const MIN_NEXT_TIME_TO_MOVE = 700;

type DamageMapType = {
    player: Player;
    damage: number;
};

function degreeToRadian(degree: number): number {
    return (degree * Math.PI) / 180;
}

function getDeltaByDegree(degree: number, distance: number): { dx: number; dy: number } {
    const rad = degreeToRadian(degree);
    return {
        dx: distance * Math.sin(rad),
        dy: distance * Math.cos(rad),
    };
}

export default class Behavior {
    private readonly monster: Monster;
    private initialPositionX: number = 0;
    private initialPositionY: number = 0;
    private nextMove: number = this.calcDelay();
    private enable: boolean = false;
    private nextAttackTime: number = 0;
    private lastAttackTime: number = 0;
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
        this.damageMap.clear();
        this.monster.goto(this.lastAttackPositionX, this.lastAttackPositionY);
    }

    tick() {
        if (!this.enable) return;
        if (this.monster.isAffectByFlag(AffectBitsTypeEnum.STUN)) return;
        if (this.monster.isDead()) return;

        const now = performance.now();

        if (this.target) {
            if (this.target.isDead()) {
                this.damageMap.delete(this.target.getVirtualId());
                //TODO next target
                return;
            }

            if (this.lastAttackTime) {
                const toMuchTimeWithoutAttack = this.lastAttackTime + MAX_TIME_WITHOUT_ATTACK <= now;
                const tooFar =
                    this.getDistance(this.lastAttackPositionX, this.lastAttackPositionY) >= MAX_DISTANCE_WITHOUT_ATTACK;

                if (toMuchTimeWithoutAttack || tooFar) {
                    this.moveToOriginalPosition();
                    return;
                }
            }
            const distanceFromTarget = this.getDistanceFromTarget();
            console.log('distance: ', distanceFromTarget);
            console.log('range: ', this.monster.getAttackRange());

            switch (this.monster.getState()) {
                case EntityStateEnum.MOVING: {
                    if (distanceFromTarget > Math.max(300, this.monster.getAttackRange() * 1.15)) {
                        if (this.nextMoveTime <= now) {
                            this.moveToTarget();
                            this.nextMoveTime = now;
                            this.nextMoveTime += MIN_NEXT_TIME_TO_MOVE; //move each ~500ms
                        }
                    }
                    break;
                }
                case EntityStateEnum.IDLE: {
                    if (distanceFromTarget > this.monster.getAttackRange()) {
                        if (this.nextMoveTime <= now) {
                            this.moveToTarget();
                            this.nextMoveTime = now;
                            this.nextMoveTime += MIN_NEXT_TIME_TO_MOVE; //move each ~500ms
                        }
                    } else {
                        if (this.nextAttackTime <= now) {
                            this.attack();
                            this.nextAttackTime = now;
                            this.nextAttackTime += Math.max(
                                MIN_NEXT_TIME_TO_ATTACK,
                                BASE_NEXT_TIME_TO_ATTACK / (this.monster.getAttackSpeed() / 100),
                            );
                            this.lastAttackTime = now;
                            this.lastAttackPositionX = this.monster.getPositionX();
                            this.lastAttackPositionY = this.monster.getPositionY();
                        }
                    }
                    break;
                }
            }
        } else {
            if (this.monster.getState() === EntityStateEnum.IDLE) {
                if (now >= this.nextMove) {
                    this.moveToRandomLocation();
                    this.nextMove = this.calcDelay();
                }
            }
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

    private moveToTarget() {
        //TODO: its working ok, but we can improve this logic
        // let directionX = this.target.getPositionX() - this.monster.getPositionX();
        // let directionY = this.target.getPositionY() - this.monster.getPositionY();
        // const directionLength = Math.sqrt(directionX * directionX + directionY * directionY);
        // directionX /= directionLength;
        // directionY /= directionLength;

        // const targetX =
        //     this.target.getPositionX() +
        //     directionX * this.monster.getAttackRange() * (MathUtil.getRandomInt(1, 4) / 100);
        // const targetY =
        //     this.target.getPositionY() +
        //     directionY * this.monster.getAttackRange() * (MathUtil.getRandomInt(1, 4) / 100);
        // const distance = MathUtil.getRandomInt(400, 1500);

        const angle = MathUtil.getRandomInt(0, 359);

        const { dx, dy } = getDeltaByDegree(angle, Math.random() * (this.monster.getAttackRange() / 2));

        const targetX = this.target.getPositionX() + dx;
        const targetY = this.target.getPositionY() + dy;
        console.log('X: ', targetX, this.target.getPositionX());
        console.log('Y: ', targetY, this.target.getPositionY());
        this.monster.goto(targetX, targetY);
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
