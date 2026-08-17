import { expect } from 'chai';
import sinon from 'sinon';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as zlib from 'node:zlib';
import Area from '@/core/domain/Area';
import MathUtil from '@/core/domain/util/MathUtil';
import { MapAttributeFlagEnum } from '@/core/enum/MapAttributeFlagEnum';

const CELL_SIZE = 100;
const SPAWN_POSITION_MULTIPLIER = 100;

/** Writes a <mapName>.attr.gz the same way tools/attrConverter.js does. */
const writeGridFile = (
    directory: string,
    mapName: string,
    widthCells: number,
    heightCells: number,
    cells: Array<[number, number, number]>,
) => {
    const header = Buffer.alloc(17);
    header.write('MATR', 0, 'latin1');
    header.writeUInt8(1, 4);
    header.writeUInt32LE(CELL_SIZE, 5);
    header.writeUInt32LE(widthCells, 9);
    header.writeUInt32LE(heightCells, 13);

    const data = Buffer.alloc(widthCells * heightCells);
    for (const [x, y, value] of cells) data.writeUInt8(value, y * widthCells + x);

    fs.writeFileSync(path.join(directory, `${mapName}.attr.gz`), zlib.gzipSync(Buffer.concat([header, data])));
};

const createEntity = (x: number, y: number) => {
    let positionX = x;
    let positionY = y;
    return {
        getPositionX: () => positionX,
        getPositionY: () => positionY,
        setPositionX: (value: number) => (positionX = value),
        setPositionY: (value: number) => (positionY = value),
        getDirection: () => 1,
        setRotation: sinon.stub(),
    };
};

const buildArea = (attrDir: string, entities: any[] = [], mapName = 'test_map') => {
    const area = new Area(
        { name: mapName, positionX: 0, positionY: 0, width: 1, height: 1 },
        {
            spawnManager: { getEntities: sinon.stub().resolves(entities) } as any,
            entityManager: { addEntity: sinon.stub(), removeEntity: sinon.stub() } as any,
        },
    );
    sinon.stub(process, 'cwd').returns(attrDir);
    return area;
};

describe('Area map attributes', () => {
    let tmpDir: string;
    let attrDir: string;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'area-attr-'));
        attrDir = path.join(tmpDir, 'src', 'core', 'infra', 'config', 'data', 'attr');
        fs.mkdirSync(attrDir, { recursive: true });
    });

    afterEach(() => {
        sinon.restore();
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('should load the grid for its map and answer blocked positions', async () => {
        // 4x4 cells; cell (2,1) is BLOCK, cell (3,3) is OBJECT.
        writeGridFile(attrDir, 'test_map', 4, 4, [
            [2, 1, MapAttributeFlagEnum.BLOCK],
            [3, 3, MapAttributeFlagEnum.OBJECT],
        ]);

        const area = buildArea(tmpDir);
        await area.load();

        expect(area.getAttributes().hasData()).to.be.equal(true);
        expect(area.isPositionBlocked(2 * CELL_SIZE, 1 * CELL_SIZE)).to.be.equal(true);
        expect(area.isPositionBlocked(3 * CELL_SIZE, 3 * CELL_SIZE)).to.be.equal(true);
        expect(area.isPositionBlocked(0, 0)).to.be.equal(false);
    });

    it('should fall back to an empty grid when the map has no converted data', async () => {
        const area = buildArea(tmpDir, [], 'map_without_data');
        await area.load();

        expect(area.getAttributes().hasData()).to.be.equal(false);
        expect(area.isPositionBlocked(0, 0)).to.be.equal(false);
    });

    it('should move a spawn point that lands on a blocked cell', async () => {
        writeGridFile(attrDir, 'test_map', 8, 8, [[3, 4, MapAttributeFlagEnum.BLOCK]]);

        // Pin the nudge so the first candidate is (spawn - 100, spawn - 100).
        sinon.stub(MathUtil, 'getRandomInt').returns(-100);

        // Spawn config coordinates are multiplied by 100 by Area.load.
        const entity = createEntity(3, 4);
        const area = buildArea(tmpDir, [entity]);
        await area.load();

        expect(entity.getPositionX()).to.be.equal(2 * SPAWN_POSITION_MULTIPLIER);
        expect(entity.getPositionY()).to.be.equal(3 * SPAWN_POSITION_MULTIPLIER);
        expect(area.isPositionBlocked(entity.getPositionX(), entity.getPositionY())).to.be.equal(false);
    });

    it('should leave a spawn point that is already free untouched', async () => {
        writeGridFile(attrDir, 'test_map', 8, 8, [[7, 7, MapAttributeFlagEnum.BLOCK]]);

        const entity = createEntity(3, 4);
        const area = buildArea(tmpDir, [entity]);
        await area.load();

        expect(entity.getPositionX()).to.be.equal(3 * SPAWN_POSITION_MULTIPLIER);
        expect(entity.getPositionY()).to.be.equal(4 * SPAWN_POSITION_MULTIPLIER);
    });

    it('should keep spawn points unchanged for maps without attribute data', async () => {
        const entity = createEntity(9, 11);
        const area = buildArea(tmpDir, [entity], 'map_without_data');
        await area.load();

        expect(entity.getPositionX()).to.be.equal(9 * SPAWN_POSITION_MULTIPLIER);
        expect(entity.getPositionY()).to.be.equal(11 * SPAWN_POSITION_MULTIPLIER);
    });

    it('strips a season1/season2 atlas prefix for both the attribute grid and spawn lookups (issue #267)', async () => {
        // Attribute/spawn directories are flat ("metin2_map_WL_01"), but atlasinfo.json names this
        // map "season1/metin2_map_WL_01" - both lookups must use the same stripped name.
        writeGridFile(attrDir, 'metin2_map_WL_01', 4, 4, [[2, 1, MapAttributeFlagEnum.BLOCK]]);

        const getEntities = sinon.stub().resolves([]);
        const area = new Area(
            { name: 'season1/metin2_map_WL_01', positionX: 0, positionY: 0, width: 1, height: 1 },
            {
                spawnManager: { getEntities } as any,
                entityManager: { addEntity: sinon.stub(), removeEntity: sinon.stub() } as any,
            },
        );
        sinon.stub(process, 'cwd').returns(tmpDir);

        await area.load();

        expect(getEntities.calledOnceWith('metin2_map_WL_01'), 'spawnManager.getEntities should receive the stripped name').to.be.equal(true);
        expect(area.getAttributes().hasData()).to.be.equal(true);
        expect(area.isPositionBlocked(2 * CELL_SIZE, 1 * CELL_SIZE)).to.be.equal(true);
    });
});
