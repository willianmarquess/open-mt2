import EntityStateEnum from '../../../../enum/EntityStateEnum.js';
import MathUtil from '../../../util/MathUtil.js';

const POSITION_OFFSET = 600;
const MIN_DELAY = 10000;
const MAX_DELAY = 25000;

export default class Behavior {
    #monster;
    #initialPositionX = 0;
    #initialPositionY = 0;
    #nextMove = this.#calcDelay();
    #enable = false;

    constructor(monster) {
        this.#monster = monster;
    }

    init() {
        this.#initialPositionX = this.#monster.positionX;
        this.#initialPositionY = this.#monster.positionY;
        this.#nextMove = this.#calcDelay();
        this.#enable = true;
    }

    tick() {
        if (!this.#enable) return;

        if (this.#monster.state === EntityStateEnum.IDLE) {
            const now = performance.now();
            if (now >= this.#nextMove) {
                this.#moveToRandomLocation();
                this.#nextMove = this.#calcDelay();
            }
        }
    }

    #calcDelay() {
        return performance.now() + MathUtil.getRandomInt(MIN_DELAY, MAX_DELAY);
    }

    #moveToRandomLocation() {
        const x = Math.max(
            0,
            Math.min(
                MathUtil.MAX_UINT,
                this.#initialPositionX + MathUtil.getRandomInt(-POSITION_OFFSET, POSITION_OFFSET),
            ),
        );
        const y = Math.max(
            0,
            Math.min(
                MathUtil.MAX_UINT,
                this.#initialPositionY + MathUtil.getRandomInt(-POSITION_OFFSET, POSITION_OFFSET),
            ),
        );

        this.#monster.goto(x, y);
    }
}
