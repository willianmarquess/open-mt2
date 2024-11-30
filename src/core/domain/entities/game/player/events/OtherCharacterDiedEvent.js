import PlayerEventsEnum from './PlayerEventsEnum.js';

export default class OtherCharacterDiedEvent {
    static #type = PlayerEventsEnum.OTHER_CHARACTER_DIED;

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
