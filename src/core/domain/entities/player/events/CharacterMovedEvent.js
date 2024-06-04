import PlayerEventsEnum from './PlayerEventsEnum.js';

export default class CharacterMovedEvent {
    static #type = PlayerEventsEnum.CHARACTER_MOVED;
    #entity;
    #params;

    constructor({ entity, params }) {
        this.#entity = entity;
        this.#params = params;
    }

    get entity() {
        return this.#entity;
    }

    get params() {
        return this.#params;
    }

    static get type() {
        return this.#type;
    }
}
