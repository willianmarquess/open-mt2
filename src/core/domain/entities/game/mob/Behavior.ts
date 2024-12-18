import { EntityStateEnum } from '@/core/enum/EntityStateEnum';
import MathUtil from '../../../util/MathUtil';
import Monster from '@/core/domain/entities/game/mob/Monster';

const POSITION_OFFSET = 600;
const MIN_DELAY = 10000;
const MAX_DELAY = 25000;

export default class Behavior {
    private readonly monster: Monster;
    private initialPositionX: number = 0;
    private initialPositionY: number = 0;
    private nextMove: number = this.calcDelay();
    private enable: boolean = false;

    constructor(monster: Monster) {
        this.monster = monster;
    }

    init() {
        this.initialPositionX = this.monster.getPositionX();
        this.initialPositionY = this.monster.getPositionY();
        this.nextMove = this.calcDelay();
        this.enable = true;
    }

    tick() {
        if (!this.enable) return;

        if (this.monster.getState() === EntityStateEnum.IDLE) {
            const now = performance.now();
            if (now >= this.nextMove) {
                this.moveToRandomLocation();
                this.nextMove = this.calcDelay();
            }
        }
    }

    calcDelay() {
        return performance.now() + MathUtil.getRandomInt(MIN_DELAY, MAX_DELAY);
    }

    moveToRandomLocation() {
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
