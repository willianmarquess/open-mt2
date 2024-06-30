import Item from '../entities/game/item/Item.js';

export default class ItemManager {
    #config;
    #items = new Map();

    constructor({ config }) {
        this.#config = config;
    }

    load() {
        this.#config.items.forEach((item) => {
            this.#items.set(item.vnum, item);
        });
    }

    hasItem(id) {
        return this.#items.has(id);
    }

    getItem(id) {
        if (!this.hasItem(id)) {
            return;
        }

        const proto = this.#items.get(id);

        return Item.create(proto);
    }
}
