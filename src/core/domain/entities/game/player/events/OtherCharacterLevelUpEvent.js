import PlayerEventsEnum from './PlayerEventsEnum.js';

export default class OtherCharacterLevelUpEvent {
    static #type = PlayerEventsEnum.OTHER_CHARACTER_LEVEL_UP;

    #virtualId;
    #level;

    constructor({ virtualId, level }) {
        this.#virtualId = virtualId;
        this.#level = level;
    }

    get virtualId() {
        return this.#virtualId;
    }

    get level() {
        return this.#level;
    }

    static get type() {
        return this.#type;
    }
}
