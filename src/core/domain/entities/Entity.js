export default class Entity {
    #id;
    #createdAt;
    #updatedAt;

    constructor({ id, createdAt, updatedAt }) {
        this.#id = id;
        this.#createdAt = createdAt;
        this.#updatedAt = updatedAt;
    }

    get createdAt() {
        return this.#createdAt;
    }

    get updatedAt() {
        return this.#updatedAt;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value;
    }
}
