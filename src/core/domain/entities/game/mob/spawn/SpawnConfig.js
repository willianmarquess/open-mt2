import SpawnConfigTypeEnum from '../../../../../enum/SpawnConfigTypeEnum.js';

const SpawnConfigMap = {
    g: SpawnConfigTypeEnum.GROUP,
    m: SpawnConfigTypeEnum.MONSTER,
    e: SpawnConfigTypeEnum.EXCEPTION,
    r: SpawnConfigTypeEnum.GROUP_COLLECTION,
    s: SpawnConfigTypeEnum.SPECIAL,
};

export default class SpawnConfig {
    #type;
    #x;
    #y;
    #rangeX;
    #rangeY;
    #direction;
    #respawnTime;
    #id;
    #count;

    constructor({ type, x, y, rangeX, rangeY, direction, respawnTime, id, count }) {
        this.#type = type;
        this.#x = x;
        this.#y = y;
        this.#rangeX = rangeX;
        this.#rangeY = rangeY;
        this.#direction = direction;
        this.#respawnTime = respawnTime;
        this.#id = id;
        this.#count = count;
    }

    get type() {
        return this.#type;
    }
    get x() {
        return this.#x;
    }
    get y() {
        return this.#y;
    }
    get rangeX() {
        return this.#rangeX;
    }
    get rangeY() {
        return this.#rangeY;
    }
    get direction() {
        return this.#direction;
    }
    get respawnTime() {
        return this.#respawnTime;
    }
    get id() {
        return this.#id;
    }
    get count() {
        return this.#count;
    }

    isAggresive() {}

    static create({ type, x, y, rangeX, rangeY, direction, respawnTime, id, count }) {
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
