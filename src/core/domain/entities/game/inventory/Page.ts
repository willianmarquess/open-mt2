import Grid from '@/core/util/Grid';
import Item from '../item/Item';

export default class Page {
    private grid: Grid<Item>;

    constructor(width: number, height: number) {
        this.grid = new Grid(width, height, 0);
    }

    getGrid() {
        return this.grid;
    }

    addItem(item: Item) {
        for (let y = 0; y < this.grid.getHeight(); y++) {
            for (let x = 0; x < this.grid.getWidth(); x++) {
                if (this.haveSpaceAvailable(x, y, item.getSize())) {
                    for (let i = 0; i < item.getSize(); i++) {
                        this.grid.setValue(x, y + i, item);
                    }
                    return x + y * this.grid.getWidth();
                }
            }
        }

        return -1;
    }

    addItemAt(item: Item, position: number) {
        if (position < 0 || position >= this.grid.getWidth() * this.grid.getHeight()) return;

        const { x, y } = this.calcPosition(position);
        if (!this.haveSpaceAvailable(x, y, item.getSize())) return false;

        for (let i = 0; i < item.getSize(); i++) {
            this.grid.setValue(x, y + i, item);
        }

        return true;
    }

    haveSpaceAvailable(x: number, y: number, size: number) {
        for (let i = 0; i < size; i++) {
            if (y + i >= this.grid.getHeight()) return false;

            if (this.grid.getValue(x, y + i)) {
                return false;
            }
        }

        return true;
    }

    calcPosition(position: number) {
        const x = Math.floor(position % this.grid.getWidth());
        const y = Math.floor(position / this.grid.getWidth());

        return {
            x,
            y,
        };
    }

    haveAvailablePosition(position: number, size: number) {
        if (position < 0 || position >= this.grid.getWidth() * this.grid.getHeight()) return false;

        const { x, y } = this.calcPosition(position);

        return this.haveSpaceAvailable(x, y, size);
    }

    getItem(position: number) {
        if (position < 0 || position >= this.grid.getWidth() * this.grid.getHeight()) return;

        const { x, y } = this.calcPosition(position);

        return this.grid.getValue(x, y);
    }

    removeItem(position: number, size: number) {
        if (position < 0 || position >= this.grid.getWidth() * this.grid.getHeight()) return;

        const { x, y } = this.calcPosition(position);

        for (let i = 0; i < size; i++) {
            this.grid.setValue(x, y + i, null);
        }
    }
}
