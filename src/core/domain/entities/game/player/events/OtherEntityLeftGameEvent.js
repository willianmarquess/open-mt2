import PlayerEventsEnum from './PlayerEventsEnum.js';

export default class OtherEntityLeftGameEvent {
    static #type = PlayerEventsEnum.OTHER_CHARACTER_LEFT_GAME;
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