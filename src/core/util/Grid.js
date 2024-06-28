export default class Grid {
    constructor(width, height, defaultValue = 0) {
        this.width = width;
        this.height = height;
        this.grid = Array.from({ length: width }, () => Array(height).fill(defaultValue));
    }

    getValue(x, y) {
        if (this.isValidPosition(x, y)) {
            return this.grid[x][y];
        }
    }

    setValue(x, y, value) {
        if (this.isValidPosition(x, y)) {
            this.grid[x][y] = value;
        }
    }

    isValidPosition(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    printGrid() {
        for (let y = 0; y < this.height; y++) {
            let row = [];
            for (let x = 0; x < this.width; x++) {
                row.push(this.grid[x][y]);
            }
            console.log(row.join(' '));
        }
    }
}
