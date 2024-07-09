import PlayerEventsEnum from './PlayerEventsEnum.js';

export default class DropItemEvent {
    static #type = PlayerEventsEnum.DROP_ITEM;

    #item;
    #count;
    #positionX;
    #positionY;
    #ownerName;

    constructor({ item, count, positionX, positionY, ownerName }) {
        this.#item = item;
        this.#count = count;
        this.#positionX = positionX;
        this.#positionY = positionY;
        this.#ownerName = ownerName;
    }

    get item() {
        return this.#item;
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

    static get type() {
        return this.#type;
    }
}
