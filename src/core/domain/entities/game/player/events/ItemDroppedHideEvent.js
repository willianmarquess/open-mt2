import PlayerEventsEnum from './PlayerEventsEnum.js';

export default class ItemDroppedHideEvent {
    static #type = PlayerEventsEnum.ITEM_DROPPED_HIDE;

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
