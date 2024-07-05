import InventoryEventsEnum from './InventoryEventsEnum.js';

export default class ItemUnequippedEvent {
    static #type = InventoryEventsEnum.ITEM_UNEQUIPPED;
    static get type() {
        return this.#type;
    }

    #item;
    #slot;

    constructor({ item, slot }) {
        this.#item = item;
        this.#slot = slot;
    }

    get item() {
        return this.#item;
    }

    get slot() {
        return this.#slot;
    }
}
