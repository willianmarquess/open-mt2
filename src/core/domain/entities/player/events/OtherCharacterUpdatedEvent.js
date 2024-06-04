import PlayerEventsEnum from './PlayerEventsEnum.js';

export default class OtherCharacterUpdatedEvent {
    static #type = PlayerEventsEnum.OTHER_CHARACTER_UPDATED;
    #otherEntity;

    constructor({ otherEntity }) {
        this.#otherEntity = otherEntity;
    }

    get otherEntity() {
        return this.#otherEntity;
    }

    static get type() {
        return this.#type;
    }
}
