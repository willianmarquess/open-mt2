export default class Animation {
    #duration;
    #accX;
    #accY;
    #accZ;

    constructor({ duration, accX, accY, accZ }) {
        this.#duration = duration;
        this.#accX = accX;
        this.#accY = accY;
        this.#accZ = accZ;
    }

    get duration() {
        return this.#duration;
    }
    get accX() {
        return this.#accX;
    }
    get accY() {
        return this.#accY;
    }
    get accZ() {
        return this.#accZ;
    }
}
