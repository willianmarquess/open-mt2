import PlayerEventsEnum from './PlayerEventsEnum.js';

export default class TargetUpdatedEvent {
    static #type = PlayerEventsEnum.TARGET_UPDATED;

    #virtualId;
    #healthPercentage;

    constructor({ virtualId, healthPercentage }) {
        this.#virtualId = virtualId;
        this.#healthPercentage = healthPercentage;
    }

    get virtualId() {
        return this.#virtualId;
    }
    get healthPercentage() {
        return this.#healthPercentage;
    }
    static get type() {
        return this.#type;
    }
}
