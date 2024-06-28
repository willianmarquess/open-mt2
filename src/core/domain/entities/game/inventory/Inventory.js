import Page from './Page.js';

const WindowTypeEnum = {
    INVENTORY: 1,
    EQUIPMENT: 2,
};

const DEFAULT_INVENTORY_WIDTH = 5;
const DEFAULT_INVENTORY_HEIGHT = 9;

export default class Inventory {
    #pages = [];
    #width = DEFAULT_INVENTORY_WIDTH;
    #height = DEFAULT_INVENTORY_HEIGHT;

    constructor({ config }) {
        for (let i = 0; i < config.INVENTORY_PAGES; i++) {
            this.#pages.push(new Page(this.#width, this.#height));
        }
    }

    get pages() {
        return this.#pages;
    }

    size() {
        return this.#width * this.#height * this.#pages.length;
    }

    setItem(item) {
        for (let i = 0; i < this.#pages.length; i++) {
            const page = this.#pages[i];

            var position = page.setItem(item);
            if (position != -1) {
                return true;
            }
        }

        return false;
    }
}
