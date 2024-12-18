import { expect } from 'chai';
import Grid from '../../../../src/core/util/Grid';

describe('Grid', () => {
    let grid;
    const defaultValue = 'empty';

    beforeEach(() => {
        grid = new Grid(3, 3, defaultValue);
    });

    it('should initialize with the correct dimensions', () => {
        expect(grid.width).to.equal(3);
        expect(grid.height).to.equal(3);
    });

    it('should initialize with the default value', () => {
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                expect(grid.getValue(x, y)).to.equal(defaultValue);
            }
        }
    });

    it('should set and get a value correctly', () => {
        grid.setValue(1, 1, 'test');
        expect(grid.getValue(1, 1)).to.equal('test');
    });

    it('should not set a value out of bounds', () => {
        grid.setValue(3, 3, 'out');
        expect(grid.getValue(3, 3)).to.be.undefined;
    });

    it('should return undefined for out of bounds get', () => {
        expect(grid.getValue(3, 3)).to.be.undefined;
        expect(grid.getValue(-1, -1)).to.be.undefined;
    });

    it('should validate positions correctly', () => {
        expect(grid.isValidPosition(0, 0)).to.be.true;
        expect(grid.isValidPosition(2, 2)).to.be.true;
        expect(grid.isValidPosition(3, 3)).to.be.false;
        expect(grid.isValidPosition(-1, 0)).to.be.false;
    });
});
