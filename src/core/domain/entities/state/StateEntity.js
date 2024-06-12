export default class StateEntity {
    #id;
    #updatedAt;
    #createdAt;

    constructor({ id, createdAt, updatedAt }) {
        this.#id = id;
        this.#createdAt = createdAt;
        this.#updatedAt = updatedAt;
    }

    get id() {
        return this.#id;
    }
    get createdAt() {
        return this.#createdAt;
    }
    get updatedAt() {
        return this.#updatedAt;
    }
}
