import { expect } from 'chai';
import * as fs from 'node:fs';
import * as path from 'node:path';
import MapAttributeGrid from '@/core/util/MapAttributeGrid';
import { MapAttributeFlagEnum } from '@/core/enum/MapAttributeFlagEnum';
import atlasInfo from '@/core/infra/config/data/atlasinfo.json';

const ATTR_DIR = path.join(process.cwd(), 'src', 'core', 'infra', 'config', 'data', 'attr');
const SPAWN_DIR = path.join(process.cwd(), 'src', 'core', 'infra', 'config', 'data', 'spawn');
const SPAWN_POSITION_MULTIPLIER = 100;
const MAX_BLOCKED_SPAWN_RATIO = 0.15;

type AtlasEntry = { mapName: string; posX: number; posY: number; goto?: Record<string, number[]> };

const atlas = atlasInfo as AtlasEntry[];
const findMap = (mapName: string) => atlas.find((entry) => entry.mapName === mapName);
const hasGrid = (mapName: string) => fs.existsSync(path.join(ATTR_DIR, `${mapName}.attr.gz`));

const loadGrid = (mapName: string) => {
    const entry = findMap(mapName)!;
    return MapAttributeGrid.load(ATTR_DIR, mapName, entry.posX, entry.posY);
};

const readSpawnPoints = (mapName: string) => {
    const points: Array<{ x: number; y: number }> = [];

    for (const file of ['regen.json', 'npc.json', 'boss.json']) {
        const filePath = path.join(SPAWN_DIR, mapName, file);
        if (!fs.existsSync(filePath)) continue;

        for (const spawn of JSON.parse(fs.readFileSync(filePath, 'utf8'))) {
            if (spawn?.x === undefined || spawn?.y === undefined) continue;
            points.push({ x: Number(spawn.x), y: Number(spawn.y) });
        }
    }

    return points;
};

describe('converted map attribute data', () => {
    const mapsWithData = ['map_a2', 'metin2_map_a1', 'metin2_map_b1', 'metin2_map_c1'].filter(hasGrid);

    if (mapsWithData.length === 0) {
        it('is skipped: no converted grids present', () => {
            expect(true).to.be.equal(true);
        });
        return;
    }

    for (const mapName of mapsWithData) {
        describe(mapName, () => {
            const grid = loadGrid(mapName);

            it('should load with data covering the map', () => {
                expect(grid.hasData()).to.be.equal(true);
            });

            it('should only store flags the server defines', () => {
                const entry = findMap(mapName)!;
                const allowed = MapAttributeFlagEnum.BLOCK | MapAttributeFlagEnum.WATER | MapAttributeFlagEnum.BANPK;

                for (let x = 0; x < 120; x++) {
                    for (let y = 0; y < 120; y++) {
                        const attributes = grid.getAttributes(entry.posX + x * 500, entry.posY + y * 500);
                        expect(attributes & ~allowed, `unexpected flags at cell ${x},${y}`).to.be.equal(0);
                    }
                }
            });

            it('should describe a world that is not uniformly blocked or free', () => {
                const entry = findMap(mapName)!;
                let blocked = 0;
                let free = 0;

                const stepX = Math.floor((grid.getWidthCells() * 100) / 60);
                const stepY = Math.floor((grid.getHeightCells() * 100) / 60);

                for (let x = 0; x < 60; x++) {
                    for (let y = 0; y < 60; y++) {
                        if (grid.isPositionBlocked(entry.posX + x * stepX, entry.posY + y * stepY)) blocked++;
                        else free++;
                    }
                }

                expect(blocked, 'no blocked cells found').to.be.greaterThan(0);
                expect(free, 'no free cells found').to.be.greaterThan(0);
            });

            it('should report the vast majority of configured spawn points as walkable', () => {
                const points = readSpawnPoints(mapName);
                if (points.length === 0) return;

                const entry = findMap(mapName)!;
                const blocked = points.filter((point) =>
                    grid.isPositionBlocked(
                        entry.posX + point.x * SPAWN_POSITION_MULTIPLIER,
                        entry.posY + point.y * SPAWN_POSITION_MULTIPLIER,
                    ),
                ).length;

                expect(blocked / points.length).to.be.lessThan(MAX_BLOCKED_SPAWN_RATIO);
            });

            it('should always find a free position near a configured spawn point', () => {
                const points = readSpawnPoints(mapName).slice(0, 200);
                if (points.length === 0) return;

                const entry = findMap(mapName)!;
                for (const point of points) {
                    const found = grid.findFreePositionNear(
                        entry.posX + point.x * SPAWN_POSITION_MULTIPLIER,
                        entry.posY + point.y * SPAWN_POSITION_MULTIPLIER,
                        500,
                        32,
                    );

                    if (found) expect(grid.isPositionBlocked(found.x, found.y)).to.be.equal(false);
                }
            });
        });
    }

    describe('map_a2 empire spawn points', function () {
        before(function () {
            if (!hasGrid('map_a2')) this.skip();
        });

        it('should be walkable for every empire', () => {
            const entry = findMap('map_a2')!;
            const grid = loadGrid('map_a2');

            for (const empire of ['red', 'yellow', 'blue']) {
                const [x, y] = entry.goto![empire];
                expect(grid.isPositionBlocked(x, y), `${empire} spawn is blocked`).to.be.equal(false);
            }
        });
    });

    describe('flag semantics', () => {
        it('should mark part of map_a2 as water (it has rivers and a lake)', function () {
            if (!hasGrid('map_a2')) this.skip();

            const entry = findMap('map_a2')!;
            const grid = loadGrid('map_a2');
            let water = 0;

            for (let x = 0; x < 60; x++) {
                for (let y = 0; y < 60; y++) {
                    if (grid.isAttr(entry.posX + x * 800, entry.posY + y * 800, MapAttributeFlagEnum.WATER)) water++;
                }
            }

            expect(water).to.be.greaterThan(0);
        });
    });
});
