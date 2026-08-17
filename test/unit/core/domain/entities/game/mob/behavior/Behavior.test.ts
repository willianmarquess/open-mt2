import { expect } from 'chai';
import sinon from 'sinon';
import Behavior from '@/core/domain/entities/game/mob/behavior/Behavior';
import MapAttributeGrid from '@/core/util/MapAttributeGrid';
import { MapAttributeFlagEnum } from '@/core/enum/MapAttributeFlagEnum';
import { EntityStateEnum } from '@/core/enum/EntityStateEnum';

const CELL_SIZE = 100;

const buildGrid = (widthCells: number, heightCells: number, cells: Array<[number, number, number]>) => {
    const header = Buffer.alloc(17);
    header.write('MATR', 0, 'latin1');
    header.writeUInt8(1, 4);
    header.writeUInt32LE(CELL_SIZE, 5);
    header.writeUInt32LE(widthCells, 9);
    header.writeUInt32LE(heightCells, 13);

    const data = Buffer.alloc(widthCells * heightCells);
    for (const [x, y, value] of cells) data.writeUInt8(value, y * widthCells + x);

    return MapAttributeGrid.fromBuffer(Buffer.concat([header, data]), 0, 0);
};

const createMonster = (grid?: MapAttributeGrid, positionX = 500, positionY = 500) => {
    const area = grid ? { isPositionBlocked: (x: number, y: number) => grid.isPositionBlocked(x, y) } : undefined;

    return {
        goto: sinon.stub(),
        setState: sinon.stub(),
        setPos: sinon.stub(),
        setRotation: sinon.stub(),
        removeTarget: sinon.stub(),
        getRotation: () => 0,
        getPositionX: () => positionX,
        getPositionY: () => positionY,
        getTarget: () => undefined,
        getArea: () => area,
        isDead: () => false,
        isAffectByFlag: () => false,
        isAggresive: () => false,
        getShouldProtectStone: () => false,
        getAttackRange: () => 200,
        getMovementSpeed: () => 100,
        getNearbyEntities: () => new Map(),
        getState: () => EntityStateEnum.IDLE,
    };
};

/** Forces idleState past its random delay so the wander runs on demand. */
const wander = (behavior: Behavior) => {
    (behavior as any).nextMove = 0;
    behavior.idleState();
};

describe('Behavior map attribute awareness', () => {
    afterEach(() => sinon.restore());

    describe('idle wander', () => {
        it('should move when the destination and the halfway point are free', () => {
            const monster = createMonster(buildGrid(16, 16, []));
            const behavior = new Behavior(monster as any);
            behavior.init();

            wander(behavior);

            expect(monster.goto.calledOnce).to.be.equal(true);
        });

        it('should skip the wander when the destination is blocked', () => {
            // Everything blocked except the monster's own cell (5,5).
            const cells: Array<[number, number, number]> = [];
            for (let y = 0; y < 16; y++)
                for (let x = 0; x < 16; x++) if (!(x === 5 && y === 5)) cells.push([x, y, MapAttributeFlagEnum.BLOCK]);

            const monster = createMonster(buildGrid(16, 16, cells));
            const behavior = new Behavior(monster as any);
            behavior.init();

            wander(behavior);

            expect(monster.goto.called).to.be.equal(false);
        });

        it('should skip the wander when only the halfway point is blocked', () => {
            // Monster at (500,500) = cell (5,5). Block a ring of cells around it
            // so any destination's midpoint falls on a blocked cell.
            const cells: Array<[number, number, number]> = [];
            for (let x = 3; x <= 7; x++) {
                for (let y = 3; y <= 7; y++) {
                    if (x === 5 && y === 5) continue;
                    cells.push([x, y, MapAttributeFlagEnum.BLOCK]);
                }
            }

            const monster = createMonster(buildGrid(16, 16, cells));
            const behavior = new Behavior(monster as any);
            behavior.init();

            // POSITION_OFFSET is 600 units = 6 cells, so destinations land outside
            // the blocked ring while midpoints land inside it.
            for (let i = 0; i < 20; i++) wander(behavior);

            for (const call of monster.goto.getCalls()) {
                const [x, y] = call.args;
                const midX = (500 + x) / 2;
                const midY = (500 + y) / 2;
                expect(buildGrid(16, 16, cells).isPositionBlocked(midX, midY)).to.be.equal(false);
            }
        });

        it('should always move on maps without attribute data', () => {
            const monster = createMonster(undefined);
            const behavior = new Behavior(monster as any);
            behavior.init();

            wander(behavior);

            expect(monster.goto.calledOnce).to.be.equal(true);
        });
    });

    describe('attack repositioning', () => {
        const reposition = (behavior: Behavior, args: any) => (behavior as any).changeAttackPosition(args);

        it('should pick a free spot around the target when one exists', () => {
            // Block the left half of the map; the target sits on the boundary.
            const cells: Array<[number, number, number]> = [];
            for (let y = 0; y < 16; y++) for (let x = 0; x < 8; x++) cells.push([x, y, MapAttributeFlagEnum.BLOCK]);
            const grid = buildGrid(16, 16, cells);

            const monster = createMonster(grid, 900, 800);
            const behavior = new Behavior(monster as any);
            behavior.init();

            for (let i = 0; i < 25; i++) {
                const { dx, dy } = reposition(behavior, {
                    targetX: 900,
                    targetY: 800,
                    monsterX: 900,
                    monsterY: 800,
                    minDistance: 200,
                });
                expect(grid.isPositionBlocked(dx, dy)).to.be.equal(false);
            }
        });

        it('should still return a position when everything around is blocked', () => {
            const cells: Array<[number, number, number]> = [];
            for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) cells.push([x, y, MapAttributeFlagEnum.BLOCK]);

            const monster = createMonster(buildGrid(16, 16, cells), 800, 800);
            const behavior = new Behavior(monster as any);
            behavior.init();

            const result = reposition(behavior, {
                targetX: 800,
                targetY: 800,
                monsterX: 800,
                monsterY: 800,
                minDistance: 200,
            });

            expect(result).to.have.keys(['dx', 'dy']);
            expect(Number.isFinite(result.dx)).to.be.equal(true);
            expect(Number.isFinite(result.dy)).to.be.equal(true);
        });
    });
});
