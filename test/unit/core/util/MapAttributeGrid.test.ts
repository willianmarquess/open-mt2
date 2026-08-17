import { expect } from 'chai';
import MapAttributeGrid from '@/core/util/MapAttributeGrid';
import { MapAttributeFlagEnum } from '@/core/enum/MapAttributeFlagEnum';

const CELL_SIZE = 100;

const buildGridBuffer = (widthCells: number, heightCells: number, cells: Array<[number, number, number]>) => {
    const header = Buffer.alloc(17);
    header.write('MATR', 0, 'latin1');
    header.writeUInt8(1, 4);
    header.writeUInt32LE(CELL_SIZE, 5);
    header.writeUInt32LE(widthCells, 9);
    header.writeUInt32LE(heightCells, 13);

    const data = Buffer.alloc(widthCells * heightCells);
    for (const [x, y, value] of cells) {
        data.writeUInt8(value, y * widthCells + x);
    }

    return Buffer.concat([header, data]);
};

describe('MapAttributeGrid', () => {
    describe('fromBuffer', () => {
        it('should reject a buffer with a bad magic', () => {
            expect(() => MapAttributeGrid.fromBuffer(Buffer.from('NOPE'), 0, 0)).to.throw('invalid magic');
        });

        it('should reject a buffer whose size does not match its header', () => {
            const buffer = buildGridBuffer(4, 4, []);
            expect(() => MapAttributeGrid.fromBuffer(buffer.subarray(0, buffer.length - 1), 0, 0)).to.throw(
                'size mismatch',
            );
        });
    });

    describe('attribute lookup', () => {
        const baseX = 256_000;
        const baseY = 665_600;
        // 4x4 cells: BLOCK at cell (1,2), WATER at (3,0), BLOCK|BANPK at (0,0)
        const grid = MapAttributeGrid.fromBuffer(
            buildGridBuffer(4, 4, [
                [1, 2, MapAttributeFlagEnum.BLOCK],
                [3, 0, MapAttributeFlagEnum.WATER],
                [0, 0, MapAttributeFlagEnum.BLOCK | MapAttributeFlagEnum.BANPK],
            ]),
            baseX,
            baseY,
        );

        it('should translate absolute world coordinates through the area base', () => {
            expect(grid.getAttributes(baseX + 1 * CELL_SIZE, baseY + 2 * CELL_SIZE)).to.be.equal(
                MapAttributeFlagEnum.BLOCK,
            );
            expect(grid.getAttributes(baseX + 3 * CELL_SIZE + 50, baseY + 25)).to.be.equal(MapAttributeFlagEnum.WATER);
            expect(grid.getAttributes(baseX + 2 * CELL_SIZE, baseY + 2 * CELL_SIZE)).to.be.equal(
                MapAttributeFlagEnum.NONE,
            );
        });

        it('should answer NONE outside the grid bounds', () => {
            expect(grid.getAttributes(baseX - 1, baseY)).to.be.equal(MapAttributeFlagEnum.NONE);
            expect(grid.getAttributes(baseX + 4 * CELL_SIZE, baseY)).to.be.equal(MapAttributeFlagEnum.NONE);
        });

        it('should test single and combined flags', () => {
            expect(grid.isAttr(baseX, baseY, MapAttributeFlagEnum.BANPK)).to.be.equal(true);
            expect(grid.isAttr(baseX, baseY, MapAttributeFlagEnum.WATER)).to.be.equal(false);
            expect(grid.hasAnyAttr(baseX, baseY, MapAttributeFlagEnum.WATER | MapAttributeFlagEnum.BLOCK)).to.be.equal(
                true,
            );
        });

        it('should consider BLOCK and OBJECT cells blocked for movement', () => {
            const withObject = MapAttributeGrid.fromBuffer(
                buildGridBuffer(2, 1, [[1, 0, MapAttributeFlagEnum.OBJECT]]),
                0,
                0,
            );
            expect(withObject.isPositionBlocked(CELL_SIZE, 0)).to.be.equal(true);
            expect(withObject.isPositionBlocked(0, 0)).to.be.equal(false);
        });
    });

    describe('empty grid (map without converted data)', () => {
        const grid = MapAttributeGrid.empty(1000, 1000);

        it('should answer NONE everywhere and never block', () => {
            expect(grid.hasData()).to.be.equal(false);
            expect(grid.getAttributes(1000, 1000)).to.be.equal(MapAttributeFlagEnum.NONE);
            expect(grid.isPositionBlocked(1500, 1500)).to.be.equal(false);
        });

        it('should return the requested position from findFreePositionNear', () => {
            expect(grid.findFreePositionNear(1234, 5678, 500)).to.deep.equal({ x: 1234, y: 5678 });
        });
    });

    describe('findFreePositionNear', () => {
        it('should keep a position that is already free', () => {
            const grid = MapAttributeGrid.fromBuffer(buildGridBuffer(4, 4, []), 0, 0);
            expect(grid.findFreePositionNear(150, 150, 200)).to.deep.equal({ x: 150, y: 150 });
        });

        it('should move a blocked position to a nearby free cell', () => {
            const grid = MapAttributeGrid.fromBuffer(buildGridBuffer(4, 4, [[0, 0, MapAttributeFlagEnum.BLOCK]]), 0, 0);

            const result = grid.findFreePositionNear(50, 50, 300, 64);

            expect(result).to.not.be.equal(undefined);
            expect(grid.isPositionBlocked(result!.x, result!.y)).to.be.equal(false);
        });

        it('should never nudge a position outside the map, even when every cell inside it is blocked', () => {
            // Fully blocked map: every in-bounds candidate is blocked, while any
            // out-of-bounds candidate reads as attribute-free. A spawn nudged out
            // of the map belongs to no area, which strands whatever stands there.
            const cells: Array<[number, number, number]> = [];
            for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) cells.push([x, y, MapAttributeFlagEnum.BLOCK]);
            const grid = MapAttributeGrid.fromBuffer(buildGridBuffer(4, 4, cells), 0, 0);

            for (let i = 0; i < 50; i++) {
                expect(grid.findFreePositionNear(50, 50, 500, 16)).to.be.equal(undefined);
            }
        });

        it('should give up when everything within reach is blocked', () => {
            const cells: Array<[number, number, number]> = [];
            for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) cells.push([x, y, MapAttributeFlagEnum.BLOCK]);
            const grid = MapAttributeGrid.fromBuffer(buildGridBuffer(4, 4, cells), 0, 0);

            expect(grid.findFreePositionNear(200, 200, 100, 16)).to.be.equal(undefined);
        });
    });
});
