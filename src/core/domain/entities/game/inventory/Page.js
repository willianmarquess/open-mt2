import Grid from '../../../../util/Grid.js';

export default class Page {
    #grid;

    constructor(width, height) {
        this.#grid = new Grid(width, height, 0);
    }

    get grid() {
        return this.#grid;
    }

    addItem(item) {
        for (let y = 0; y < this.#grid.height; y++) {
            for (let x = 0; x < this.#grid.width; x++) {
                if (this.#isSpaceAvailable(x, y, item.size)) {
                    for (let i = 0; i < item.size; i++) {
                        this.#grid.setValue(x, y + i, item);
                    }
                    return x + y * this.#grid.width;
                }
            }
        }

        return -1;
    }

    #isSpaceAvailable(x, y, size) {
        for (let i = 0; i < size; i++) {
            if (y + i >= this.#grid.height) return false;

            if (this.#grid.getValue(x, y + i)) {
                return false;
            }
        }

        return true;
    }
}
