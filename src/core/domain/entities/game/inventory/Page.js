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
                if (this.#haveSpaceAvailable(x, y, item.size)) {
                    for (let i = 0; i < item.size; i++) {
                        this.#grid.setValue(x, y + i, item);
                    }
                    return x + y * this.#grid.width;
                }
            }
        }

        return -1;
    }

    addItemAt(item, position) {
        if (position < 0 || position >= this.grid.width * this.grid.height) return;

        const { x, y } = this.#calcPosition(position);

        for (let i = 0; i < item.size; i++) {
            this.#grid.setValue(x, y + i, item);
        }
    }

    #haveSpaceAvailable(x, y, size) {
        for (let i = 0; i < size; i++) {
            if (y + i >= this.#grid.height) return false;

            if (this.#grid.getValue(x, y + i)) {
                return false;
            }
        }

        return true;
    }

    #calcPosition(position) {
        const x = Math.floor(position % this.grid.width);
        const y = Math.floor(position / this.grid.width);

        return {
            x,
            y,
        };
    }

    haveAvailablePosition(position, size) {
        if (position < 0 || position >= this.grid.width * this.grid.height) return false;

        const { x, y } = this.#calcPosition(position);

        return this.#haveSpaceAvailable(x, y, size);
    }

    getItem(position) {
        if (position < 0 || position >= this.grid.width * this.grid.height) return;

        const { x, y } = this.#calcPosition(position);

        return this.#grid.getValue(x, y);
    }

    removeItem(position, size) {
        if (position < 0 || position >= this.grid.width * this.grid.height) return;

        const { x, y } = this.#calcPosition(position);

        for (let i = 0; i < size; i++) {
            this.#grid.setValue(x, y + i, null);
        }
    }
}
