import crypto from 'node:crypto';

export default class MathUtil {
    private static max_uint = 1e9;
    private static max_tiny = 255;

    static get MAX_UINT() {
        return this.max_uint;
    }

    static get MAX_TINY() {
        return this.max_tiny;
    }

    static calcDistance(x1: number, y1: number, x2: number, y2: number) {
        const a = x1 - x2;
        const b = y1 - y2;

        return Math.sqrt(a * a + b * b);
    }

    static calcRotationFromDirection(direction: number) {
        return direction == 0 ? this.getRandomInt(0, 7) * 45 : (direction - 1) * 45;
    }

    static toUnsignedNumber(value: number | string) {
        const isValidNumber = !isNaN(parseFloat(String(value))) && isFinite(Number(value)) && Number(value) > 0;
        return isValidNumber ? Number(value) : 0;
    }

    static toNumber(value: string | number) {
        const isValidNumber = !isNaN(parseFloat(String(value))) && isFinite(Number(value));
        return isValidNumber ? Number(value) : 0;
    }

    static getRandomInt(min: number, max: number) {
        const randomBytes = crypto.randomBytes(1);
        const randomInt = randomBytes[0];
        const range = max - min + 1;
        const adjustedInt = Math.floor((randomInt / 256) * range) + min;
        return adjustedInt;
    }

    static calcRotationFromXY(x: number, y: number) {
        const vectorLength = Math.sqrt(x * x + y * y);

        const normalizedX = x / vectorLength;
        const normalizedY = y / vectorLength;
        const upVectorX = 0;
        const upVectorY = 1;

        const rotationRadians = -(Math.atan2(normalizedY, normalizedX) - Math.atan2(upVectorY, upVectorX));

        let rotationDegrees = rotationRadians * (180 / Math.PI);
        if (rotationDegrees < 0) rotationDegrees += 360;
        return rotationDegrees;
    }

    static minMax(min: number, value: number, max: number) {
        const temp = min > value ? min : value;
        return max < temp ? max : temp;
    }
}
