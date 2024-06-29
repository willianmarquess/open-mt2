import PlayerEventsEnum from './PlayerEventsEnum.js';

export default class ItemAddedEvent {
    static #type = PlayerEventsEnum.ITEM_ADDED;

    #window;
    #position;
    #id;
    #count;
    #flags;
    #antiFlags;
    #highlight;
    #sockets;
    #bonuses;

    constructor({ window, position, id, count, flags, antiFlags, highlight, sockets, bonuses }) {
        this.#window = window;
        this.#position = position;
        this.#id = id;
        this.#count = count;
        this.#flags = flags;
        this.#antiFlags = antiFlags;
        this.#highlight = highlight;
        this.#sockets = sockets;
        this.#bonuses = bonuses;
    }

    get window() {
        return this.#window;
    }
    get position() {
        return this.#position;
    }
    get id() {
        return this.#id;
    }
    get count() {
        return this.#count;
    }
    get flags() {
        return this.#flags;
    }
    get antiFlags() {
        return this.#antiFlags;
    }
    get highlight() {
        return this.#highlight;
    }
    get sockets() {
        return this.#sockets;
    }
    get bonuses() {
        return this.#bonuses;
    }

    static get type() {
        return this.#type;
    }
}
