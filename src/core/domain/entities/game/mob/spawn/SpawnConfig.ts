import { SpawnConfigTypeEnum } from '../../../../../enum/SpawnConfigTypeEnum';

const SpawnConfigMap = {
    g: SpawnConfigTypeEnum.GROUP,
    m: SpawnConfigTypeEnum.MONSTER,
    e: SpawnConfigTypeEnum.EXCEPTION,
    r: SpawnConfigTypeEnum.GROUP_COLLECTION,
    s: SpawnConfigTypeEnum.SPECIAL,
};

const DEFAULT_RESPAWN_TIME_IN_MS = 10_000;
const SECOND_IN_MS = 1_000;
const MINUTE_IN_MS = SECOND_IN_MS * 60;
const HOUR_IN_MS = MINUTE_IN_MS * 60;

export default class SpawnConfig {
    private type: SpawnConfigTypeEnum;
    private x: number;
    private y: number;
    private rangeX: number;
    private rangeY: number;
    private direction: number;
    private respawnTime: string;
    private id: number;
    private count: number;

    constructor({ type, x, y, rangeX, rangeY, direction, respawnTime, id, count }) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.rangeX = rangeX;
        this.rangeY = rangeY;
        this.direction = direction;
        this.respawnTime = respawnTime;
        this.id = id;
        this.count = count;
    }

    getType() {
        return this.type;
    }
    getX() {
        return this.x;
    }
    getY() {
        return this.y;
    }
    getRangeX() {
        return this.rangeX;
    }
    getRangeY() {
        return this.rangeY;
    }
    getDirection() {
        return this.direction;
    }
    getRespawnTime() {
        return this.respawnTime;
    }
    getId() {
        return this.id;
    }
    getCount() {
        return this.count;
    }

    getRespawnTimeInMs() {
        const match = this.respawnTime?.match(/^(\d+)([smh])$/);

        if (!match) return DEFAULT_RESPAWN_TIME_IN_MS;

        const [, value, type] = match;

        switch (type) {
            case 's':
                return parseInt(value) * SECOND_IN_MS;
            case 'm':
                return parseInt(value) * MINUTE_IN_MS;
            case 'h':
                return parseInt(value) * HOUR_IN_MS;
            default:
                return DEFAULT_RESPAWN_TIME_IN_MS;
        }
    }

    static create({
        type,
        x,
        y,
        rangeX,
        rangeY,
        direction,
        respawnTime,
        id,
        count,
    }: {
        type: string;
        x: number;
        y: number;
        rangeX: number;
        rangeY: number;
        direction: number;
        respawnTime: string;
        id: number;
        count: number;
    }) {
        return new SpawnConfig({
            type: SpawnConfigMap[type] || SpawnConfigMap.m,
            x,
            y,
            rangeX,
            rangeY,
            direction,
            respawnTime,
            id,
            count,
        });
    }
}
