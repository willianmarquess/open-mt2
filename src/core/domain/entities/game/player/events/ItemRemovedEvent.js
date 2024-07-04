import PlayerEventsEnum from './PlayerEventsEnum.js';

export default class ItemRemovedEvent {
    static #type = PlayerEventsEnum.ITEM_REMOVED;

    #window;
    #position;

    constructor({ window, position }) {
        this.#window = window;
        this.#position = position;
    }

    get window() {
        return this.#window;
    }
    get position() {
        return this.#position;
    }

    static get type() {
        return this.#type;
    }
}
