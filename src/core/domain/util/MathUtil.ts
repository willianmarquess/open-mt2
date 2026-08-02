import crypto from 'node:crypto';

export default class MathUtil {
    private static readonly max_uint = 1e9;
    private static readonly max_tiny = 255;

    static get MAX_UINT() {
        return this.max_uint;
    }

    static get MAX_TINY() {
        return this.max_tiny;
    }

    static calcDistance(x1: number, y1: number, x2: number, y2: number) {
        const a = x1 - x2;
        const b = y1 - y2;

        return Math.hypot(a, b);
    }

    static calcRotationFromDirection(direction: number) {
        return direction == 0 ? this.getRandomInt(0, 7) * 45 : (direction - 1) * 45;
    }

    static toUnsignedNumber(value: number | string) {
        const isValidNumber =
            !Number.isNaN(Number.parseFloat(String(value))) && Number.isFinite(Number(value)) && Number(value) > 0;
        return isValidNumber ? Number(value) : 0;
    }

    static toNumber(value: string | number) {
        const isValidNumber = !Number.isNaN(Number.parseFloat(String(value))) && Number.isFinite(Number(value));
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
        const vectorLength = Math.hypot(x, y);

        const normalizedX = x / vectorLength;
        const normalizedY = y / vectorLength;
        const upVectorX = 0;
        const upVectorY = 1;

        const rotationRadians = -(Math.atan2(normalizedY, normalizedX) - Math.atan2(upVectorY, upVectorX));

        let rotationDegrees = rotationRadians * (180 / Math.PI);
        if (rotationDegrees < 0) rotationDegrees += 360;
        return rotationDegrees;
    }

    static calcDeltaByDegree(degree: number, distance: number) {
        const radian = degree * (Math.PI / 180);

        return {
            x: distance * Math.sin(radian),
            y: distance * Math.cos(radian),
        };
    }

    static calcDegreeDelta(degreeA: number, degreeB: number) {
        if (degreeA > 180) degreeA = degreeA - 360;

        if (degreeB > 180) degreeB = degreeB - 360;

        return Math.abs(degreeA - degreeB);
    }

    static minMax(min: number, value: number, max: number) {
        return Math.min(max, Math.max(min, value));
    }

    static degreeToRadian(degree: number): number {
        return (degree * Math.PI) / 180;
    }

    static getDeltaByDegree(degree: number, distance: number): { dx: number; dy: number } {
        const rad = this.degreeToRadian(degree);
        return {
            dx: distance * Math.sin(rad),
            dy: distance * Math.cos(rad),
        };
    }

    static radianToDegree(radian: number) {
        return radian * (180 / Math.PI);
    }

    static getDegreeFromPosition(dx: number, dy: number) {
        const angleRad = Math.atan2(dx, dy);
        let angleDeg = this.radianToDegree(angleRad);
        if (angleDeg < 0) angleDeg += 360;
        return angleDeg;
    }

    static getDegreeFromPositionXY(sx: number, sy: number, ex: number, ey: number) {
        return this.getDegreeFromPosition(ex - sx, ey - sy);
    }

    static getDegreeDelta(a: number, b: number) {
        if (a > 180) a = a - 360;

        if (b > 180) b = b - 360;

        return Math.abs(a - b);
    }

    static distanceSQRT(dx: number, dy: number) {
        return Math.hypot(dx, dy);
    }

    static calcDuration(speed: number, duration: number) {
        let i: number = 100 - speed;

        if (i > 0) i = 100 + i;
        else if (i < 0) i = 10000 / (100 - i);
        else i = 100;

        return (duration * i) / 100;
    }
}
