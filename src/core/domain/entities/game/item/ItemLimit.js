export default class ItemLimit {
    #type;
    #value;

    constructor({ type, value }) {
        this.#type = type;
        this.#value = value;
    }

    get type() {
        return this.#type;
    }
    get value() {
        return this.#value;
    }
}
