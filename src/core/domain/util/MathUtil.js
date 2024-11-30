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

    static calcRotationFromDirection(direction) {
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

    static calcRotationFromXY(x, y) {
        const vectorLength = Math.sqrt(x * x + y * y);

        const normalizedX = x / vectorLength;
        const normalizedY = y / vectorLength;
        const upVectorX = 0;
        const upVectorY = 1;

        const rotationRadians = -(Math.atan2(normalizedY, normalizedX) - Math.atan2(upVectorY, upVectorX));

        let rotationDegress = rotationRadians * (180 / Math.PI);
        if (rotationDegress < 0) rotationDegress += 360;
        return rotationDegress;
    }
}
