import SpawnConfigTypeEnum from '../../../../../enum/SpawnConfigTypeEnum';

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
    #amount;

    constructor({ type, x, y, rangeX, rangeY, direction, respawnTime, id, amount }) {
        this.#type = type;
        this.#x = x;
        this.#y = y;
        this.#rangeX = rangeX;
        this.#rangeY = rangeY;
        this.#direction = direction;
        this.#respawnTime = respawnTime;
        this.#id = id;
        this.#amount = amount;
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
    get amount() {
        return this.#amount;
    }

    isAggresive() {}

    static create({ type, x, y, rangeX, rangeY, direction, respawnTime, id, amount }) {
        return new SpawnConfig({
            type: SpawnConfigMap[type] || SpawnConfigMap.m,
            x,
            y,
            rangeX,
            rangeY,
            direction,
            respawnTime,
            id,
            amount,
        });
    }
}
