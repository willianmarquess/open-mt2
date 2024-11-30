import MonsterEventsEnum from './MonsterEventsEnum.js';

export default class MonsterDiedEvent {
    static #type = MonsterEventsEnum.MONSTER_DIED;
    #entity;

    constructor({ entity }) {
        this.#entity = entity;
    }

    get entity() {
        return this.#entity;
    }

    static get type() {
        return this.#type;
    }
}
