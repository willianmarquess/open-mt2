import Page from './Page.js';

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

    addItem(item) {
        for (let i = 0; i < this.#pages.length; i++) {
            const page = this.#pages[i];

            var position = page.addItem(item);
            if (position != -1) {
                return position + i * this.#width * this.#height;
            }
        }

        return -1;
    }

    addItemAt(item, position) {
        if (this.#isFromEquipamentSlots()) {
            //set in equipament
        }

        const page = this.#calcPage(position);
        const pagePosition = this.#calcPagePosition(page, position);
        return this.#pages[page].addItemAt(item, pagePosition);
    }

    #calcPage(position) {
        return Math.floor(position / (this.#width * this.#height));
    }

    #calcPagePosition(page, position) {
        return Math.floor(position - page * this.#width * this.#height);
    }

    #isFromEquipamentSlots(position) {
        return position > this.size();
    }

    getItem(position) {
        if (this.#isFromEquipamentSlots()) {
            //get from equipament
        }

        const page = this.#calcPage(position);
        const pagePosition = this.#calcPagePosition(page, position);
        return this.#pages[page].getItem(pagePosition);
    }

    removeItem(position, size) {
        if (this.#isFromEquipamentSlots()) {
            //remove from equipament
        }

        const page = this.#calcPage(position);
        const pagePosition = this.#calcPagePosition(page, position);
        return this.#pages[page].removeItem(pagePosition, size);
    }

    haveAvailablePosition(position, size) {
        if (this.#isFromEquipamentSlots()) {
            //verify in equipament slots
        }

        const page = this.#calcPage(position);
        const pagePosition = this.#calcPagePosition(page, position);
        return this.#pages[page].haveAvailablePosition(pagePosition, size);
    }

    moveItem(fromPosition, toPosition) {
        const item = this.getItem(fromPosition);

        if (!item) return;
        if (!this.haveAvailablePosition(toPosition, item.size)) return;

        this.removeItem(fromPosition, item.size);
        this.addItemAt(item, toPosition);
        return item;
    }
}
