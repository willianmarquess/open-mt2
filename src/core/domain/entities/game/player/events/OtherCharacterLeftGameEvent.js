import PlayerEventsEnum from './PlayerEventsEnum.js';

export default class OtherCharacterLeftGameEvent {
    static #type = PlayerEventsEnum.OTHER_CHARACTER_LEFT_GAME;
    #virtualId;

    constructor({ virtualId }) {
        this.#virtualId = virtualId;
    }

    get virtualId() {
        return this.#virtualId;
    }

    static get type() {
        return this.#type;
    }
}
