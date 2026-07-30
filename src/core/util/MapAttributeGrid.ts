import * as fsSync from 'node:fs';
import * as zlib from 'node:zlib';
import { MapAttributeFlagEnum } from '@/core/enum/MapAttributeFlagEnum';
import MathUtil from '@/core/domain/util/MathUtil';

/**
 * Grid file layout (whole file gzip-compressed):
 *   magic   4 bytes  'MATR'
 *   version 1 byte   1
 *   cell    u32 LE   cell size in world units (100 = 1m, the client's attr resolution)
 *   width   u32 LE   grid width in cells
 *   height  u32 LE   grid height in cells
 *   data    width * height bytes, row-major, one attribute byte per cell
 */
const MAGIC = 'MATR';
const VERSION = 1;
const HEADER_SIZE = MAGIC.length + 1 + 4 + 4 + 4;

export const MAP_ATTR_CELL_SIZE = 100;

export default class MapAttributeGrid {
    private readonly baseX: number;
    private readonly baseY: number;
    private readonly cellSize: number;
    private readonly widthCells: number;
    private readonly heightCells: number;
    private readonly data?: Uint8Array;

    private constructor({
        baseX,
        baseY,
        cellSize,
        widthCells,
        heightCells,
        data,
    }: {
        baseX: number;
        baseY: number;
        cellSize: number;
        widthCells: number;
        heightCells: number;
        data?: Uint8Array;
    }) {
        this.baseX = baseX;
        this.baseY = baseY;
        this.cellSize = cellSize;
        this.widthCells = widthCells;
        this.heightCells = heightCells;
        this.data = data;
    }

    static empty(baseX: number = 0, baseY: number = 0): MapAttributeGrid {
        return new MapAttributeGrid({
            baseX,
            baseY,
            cellSize: MAP_ATTR_CELL_SIZE,
            widthCells: 0,
            heightCells: 0,
        });
    }

    static fromBuffer(buffer: Buffer, baseX: number, baseY: number): MapAttributeGrid {
        if (buffer.length < HEADER_SIZE || buffer.toString('latin1', 0, MAGIC.length) !== MAGIC) {
            throw new Error('[MapAttributeGrid] invalid magic');
        }

        const version = buffer.readUInt8(MAGIC.length);
        if (version !== VERSION) {
            throw new Error(`[MapAttributeGrid] unsupported version: ${version}`);
        }

        const cellSize = buffer.readUInt32LE(MAGIC.length + 1);
        const widthCells = buffer.readUInt32LE(MAGIC.length + 5);
        const heightCells = buffer.readUInt32LE(MAGIC.length + 9);

        const expected = HEADER_SIZE + widthCells * heightCells;
        if (buffer.length !== expected) {
            throw new Error(`[MapAttributeGrid] size mismatch: expected ${expected}, got ${buffer.length}`);
        }

        return new MapAttributeGrid({
            baseX,
            baseY,
            cellSize,
            widthCells,
            heightCells,
            data: new Uint8Array(buffer.buffer, buffer.byteOffset + HEADER_SIZE, widthCells * heightCells),
        });
    }

    static load(directory: string, mapName: string, baseX: number, baseY: number): MapAttributeGrid {
        const filePath = `${directory}/${mapName}.attr.gz`;

        if (!fsSync.existsSync(filePath)) {
            return MapAttributeGrid.empty(baseX, baseY);
        }

        const buffer = zlib.gunzipSync(fsSync.readFileSync(filePath));
        return MapAttributeGrid.fromBuffer(buffer, baseX, baseY);
    }

    hasData(): boolean {
        return this.data !== undefined && this.data.length > 0;
    }

    getWidthCells(): number {
        return this.widthCells;
    }

    getHeightCells(): number {
        return this.heightCells;
    }

    getAttributes(x: number, y: number): number {
        if (!this.data) return MapAttributeFlagEnum.NONE;

        const cellX = Math.floor((x - this.baseX) / this.cellSize);
        const cellY = Math.floor((y - this.baseY) / this.cellSize);

        if (cellX < 0 || cellY < 0 || cellX >= this.widthCells || cellY >= this.heightCells) {
            return MapAttributeFlagEnum.NONE;
        }

        return this.data[cellY * this.widthCells + cellX];
    }

    isAttr(x: number, y: number, flag: MapAttributeFlagEnum): boolean {
        return (this.getAttributes(x, y) & flag) !== 0;
    }

    hasAnyAttr(x: number, y: number, flags: number): boolean {
        return (this.getAttributes(x, y) & flags) !== 0;
    }

    isPositionBlocked(x: number, y: number): boolean {
        return this.hasAnyAttr(x, y, MapAttributeFlagEnum.BLOCK | MapAttributeFlagEnum.OBJECT);
    }

    isInsideGrid(x: number, y: number): boolean {
        const cellX = Math.floor((x - this.baseX) / this.cellSize);
        const cellY = Math.floor((y - this.baseY) / this.cellSize);
        return cellX >= 0 && cellY >= 0 && cellX < this.widthCells && cellY < this.heightCells;
    }

    findFreePositionNear(
        x: number,
        y: number,
        radius: number,
        retries: number = 8,
    ): { x: number; y: number } | undefined {
        if (!this.hasData()) return { x, y };

        if (!this.isPositionBlocked(x, y)) return { x, y };

        for (let i = 0; i < retries; i++) {
            const candidateX = x + MathUtil.getRandomInt(-radius, radius);
            const candidateY = y + MathUtil.getRandomInt(-radius, radius);

            if (this.isInsideGrid(candidateX, candidateY) && !this.isPositionBlocked(candidateX, candidateY)) {
                return { x: candidateX, y: candidateY };
            }
        }

        return undefined;
    }
}
