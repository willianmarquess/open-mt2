import crypto from 'node:crypto';
import Monster from '../entities/game/mob/Monster';
import Player from '../entities/game/player/Player';

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

    static calcDeltaByDegree(degree: number, distance: number) {
        let x: number = 0;
        let y: number = 0;

        const radian = degree * (Math.PI / 180);

        x = distance * Math.sin(radian);
        y = distance * Math.cos(radian);

        return {
            x,
            y,
        };
    }

    static calcDegreeDelta(degreeA: number, degreeB: number) {
        if (degreeA > 180) degreeA = degreeA - 360;

        if (degreeB > 180) degreeB = degreeB - 360;

        return Math.abs(degreeA - degreeB);
    }

    static minMax(min: number, value: number, max: number) {
        const temp = min > value ? min : value;
        return max < temp ? max : temp;
    }

    static calcPredictMove(monster: Monster, target: Player) {
        let targetX = target.getPositionX();
        let targetY = target.getPositionY();
        const monsterX = monster.getPositionX();
        const monsterY = monster.getPositionY();

        const rotationDelta = MathUtil.calcDegreeDelta(
            monster.getRotation(),
            MathUtil.calcRotationFromXY(targetX - monsterX, targetY - monsterY),
        );

        const monsterMovementSpeed = monster.getMovementSpeed();
        const targetMovementeSpeed = target.getMovementSpeed();

        const distance = this.calcDistance(monsterX, monsterY, targetX, targetY);

        const followSpeed = monsterMovementSpeed - targetMovementeSpeed * Math.cos((rotationDelta * Math.PI) / 180);

        if (followSpeed > 0.1) {
            const meetTime = distance / followSpeed;

            if (meetTime * monsterMovementSpeed <= 1_00000) {
                const { x: estimateX, y: estimateY } = MathUtil.calcDeltaByDegree(
                    target.getRotation(),
                    meetTime * targetMovementeSpeed,
                );

                targetX += estimateX;
                targetY += estimateY;

                const newDistance = Math.sqrt(
                    (targetX - monsterX) * (targetX - monsterX) + (targetY - monsterY) * (targetY - monsterY),
                );

                if (distance < newDistance) {
                    targetX = monsterX + ((targetX - monsterX) * distance) / newDistance;
                    targetY = monsterY + ((targetY - monsterY) * distance) / newDistance;
                }
            }
        }

        return { x: targetX, y: targetY };
    }
}
