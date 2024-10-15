import crypto from 'node:crypto';

export default class MathUtil {
    static #max_uint = 1e9;
    static #max_tiny = 255;

    static get MAX_UINT() {
        return this.#max_uint;
    }

    static get MAX_TINY() {
        return this.#max_tiny;
    }

    static calcDistance(x1, y1, x2, y2) {
        const a = x1 - x2;
        const b = y1 - y2;

        return Math.sqrt(a * a + b * b);
    }

    static calcAngle(direction) {
        return direction == 0 ? this.getRandomInt(0, 7) * 45 : (direction - 1) * 45;
    }

    static toUnsignedNumber(value) {
        const isValidNumber = !isNaN(parseFloat(value)) && isFinite(value) && Number(value) > 0;
        return isValidNumber ? Number(value) : 0;
    }

    static toNumber(value) {
        const isValidNumber = !isNaN(parseFloat(value)) && isFinite(value);
        return isValidNumber ? Number(value) : 0;
    }

    static getRandomInt(min, max) {
        const randomBytes = crypto.randomBytes(1);
        const randomInt = randomBytes[0];
        const range = max - min + 1;
        const adjustedInt = Math.floor((randomInt / 256) * range) + min;
        return adjustedInt;
    }
}
