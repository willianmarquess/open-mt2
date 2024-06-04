import PlayerEventsEnum from './PlayerEventsEnum.js';

export default class OtherCharacterMovedEvent {
    static #type = PlayerEventsEnum.OTHER_CHARACTER_MOVED;
    #otherEntity;
    #params;

    constructor({ otherEntity, params }) {
        this.#otherEntity = otherEntity;
        this.#params = params;
    }

    get otherEntity() {
        return this.#otherEntity;
    }

    get params() {
        return this.#params;
    }

    static get type() {
        return this.#type;
    }
}
