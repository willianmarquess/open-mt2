import PlayerEventsEnum from './PlayerEventsEnum.js';

export default class CharacterLevelUpEvent {
    static #type = PlayerEventsEnum.CHARACTER_LEVEL_UP;
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
