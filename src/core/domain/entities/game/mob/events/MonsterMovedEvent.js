import MonsterEventsEnum from './MonsterEventsEnum.js';

export default class MonsterMovedEvent {
    static #type = MonsterEventsEnum.MONSTER_MOVED;
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
