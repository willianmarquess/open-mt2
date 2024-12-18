export default class Grid<T> {
    private width: number;
    private height: number;
    private grid: Array<Array<T>>;

    constructor(width: number, height: number, defaultValue: number = 0) {
        this.width = width;
        this.height = height;
        this.grid = Array.from({ length: width }, () => Array(height).fill(defaultValue));
    }

    getHeight() {
        return this.height;
    }

    getWidth() {
        return this.width;
    }

    getValue(x: number, y: number) {
        if (this.isValidPosition(x, y)) {
            return this.grid[x][y];
        }
    }

    setValue(x: number, y: number, value: T) {
        if (this.isValidPosition(x, y)) {
            this.grid[x][y] = value;
        }
    }

    isValidPosition(x: number, y: number) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    printGrid() {
        for (let y = 0; y < this.height; y++) {
            const row = [];
            for (let x = 0; x < this.width; x++) {
                row.push(this.grid[x][y]);
            }
            console.log(row.join(' '));
        }
    }
}
