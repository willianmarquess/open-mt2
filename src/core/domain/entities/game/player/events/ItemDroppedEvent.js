import PlayerEventsEnum from './PlayerEventsEnum.js';

export default class ItemDroppedEvent {
    static #type = PlayerEventsEnum.ITEM_DROPPED;

    #virtualId;
    #count;
    #positionX;
    #positionY;
    #ownerName;
    #id;

    constructor({ virtualId, count, positionX, positionY, ownerName, id }) {
        this.#virtualId = virtualId;
        this.#count = count;
        this.#positionX = positionX;
        this.#positionY = positionY;
        this.#ownerName = ownerName;
        this.#id = id;
    }

    get virtualId() {
        return this.#virtualId;
    }
    get count() {
        return this.#count;
    }
    get positionX() {
        return this.#positionX;
    }
    get positionY() {
        return this.#positionY;
    }
    get ownerName() {
        return this.#ownerName;
    }
    get id() {
        return this.#id;
    }

    static get type() {
        return this.#type;
    }
}
