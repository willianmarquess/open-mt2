import { expect } from 'chai';
import DropManager from '@/core/domain/manager/DropManager';
import { MobRankEnum } from '@/core/enum/MobRankEnum';
import { ItemTypeEnum } from '@/core/enum/ItemTypeEnum';

const POLYMORPH_VNUM = 70104;
const OTHER_POLYMORPH_VNUM = 70105;
const PLAIN_VNUM = 27001;

const makeItem = (vnum: number, type: ItemTypeEnum) => {
    let socket0 = 0;
    return {
        getType: () => type,
        setSocket0: (value: number) => (socket0 = value),
        getSocket0: () => socket0,
        getVnum: () => vnum,
    };
};

const makeConfig = (commonDrops: Record<string, Array<unknown>>) => ({
    commonDrops,
    dropDeltaLevel: Array.from({ length: 31 }, (_unused, i) => i * 10),
    dropDeltaBoss: Array.from({ length: 31 }, (_unused, i) => i * 10),
    dropGoldByRank: { [MobRankEnum.PAWN]: 20, [MobRankEnum.KNIGHT]: 25 },
    PERCENT_TO_MULT_GOLD_BY_50: 0,
    PERCENT_TO_MULT_GOLD_BY_10: 0,
    PERCENT_TO_MULT_GOLD_BY_5: 0,
});

const makeManager = (commonDrops: Record<string, Array<unknown>> = {}) =>
    new DropManager({
        config: makeConfig(commonDrops) as any,
        itemManager: {
            getItem: (vnum: number) =>
                makeItem(
                    vnum,
                    vnum === POLYMORPH_VNUM || vnum === OTHER_POLYMORPH_VNUM
                        ? ItemTypeEnum.ITEM_POLYMORPH
                        : ItemTypeEnum.ITEM_USE,
                ),
        } as any,
        privilegeManager: {
            getEmpirePrivilege: () => 0,
            getPlayerPrivilege: () => 0,
        } as any,
    });

const makePlayer = (level = 30) =>
    ({
        getLevel: () => level,
        getPoint: () => 0,
        getEmpire: () => 1,
        isEquippedWithUniqueItem: () => false,
    }) as any;

const makeMonster = ({
    rank = MobRankEnum.PAWN,
    level = 30,
    polymorphItem = 0,
    vnum = 101,
}: { rank?: MobRankEnum; level?: number; polymorphItem?: number; vnum?: number } = {}) =>
    ({
        getRank: () => rank,
        getLevel: () => level,
        getId: () => vnum,
        getPolymorphItem: () => polymorphItem,
        getDropItem: () => 0,
        getGoldMin: () => 10,
        getGoldMax: () => 20,
    }) as any;

describe('DropManager', () => {
    describe('common drop table lookup (issue #157)', () => {
        it('should find the table for a rank whose enum value is 0', () => {
            const manager = makeManager({ PAWN: [{ minLevel: 1, maxLevel: 99, percentage: 400, vnum: PLAIN_VNUM }] });
            manager.load();

            const drops = manager.getCommonDrops(makePlayer(), makeMonster({ rank: MobRankEnum.PAWN }), 100_000_000, 1);

            expect(drops, 'the PAWN table must be reachable by the numeric rank').to.have.lengthOf(1);
        });

        it('should find the table for a non-zero rank too', () => {
            const manager = makeManager({
                KNIGHT: [{ minLevel: 1, maxLevel: 99, percentage: 400, vnum: PLAIN_VNUM }],
            });
            manager.load();

            const drops = manager.getCommonDrops(
                makePlayer(),
                makeMonster({ rank: MobRankEnum.KNIGHT }),
                100_000_000,
                1,
            );

            expect(drops).to.have.lengthOf(1);
        });

        it('should ignore a rank name the enum does not know', () => {
            const manager = makeManager({ NOT_A_RANK: [{ minLevel: 1, maxLevel: 99, percentage: 400, vnum: 1 }] });

            expect(() => manager.load()).to.not.throw();
        });
    });

    describe('polymorph marble (issue #157)', () => {
        const table = { PAWN: [{ minLevel: 1, maxLevel: 99, percentage: 400, vnum: POLYMORPH_VNUM }] };

        it('should drop the marble only when it matches the monster, and stamp its vnum', () => {
            const manager = makeManager(table);
            manager.load();

            const drops = manager.getCommonDrops(
                makePlayer(),
                makeMonster({ polymorphItem: POLYMORPH_VNUM, vnum: 101 }),
                100_000_000,
                1,
            );

            expect(drops).to.have.lengthOf(1);
            expect((drops[0].item as any).getSocket0(), 'socket 0 carries the monster vnum').to.equal(101);
        });

        it('should not drop a marble the monster does not yield', () => {
            const manager = makeManager(table);
            manager.load();

            const drops = manager.getCommonDrops(
                makePlayer(),
                makeMonster({ polymorphItem: OTHER_POLYMORPH_VNUM }),
                100_000_000,
                1,
            );

            expect(drops, 'the table entry is 70104 but this monster yields 70105').to.have.lengthOf(0);
        });

        it('should not drop a marble for a monster that yields none', () => {
            const manager = makeManager(table);
            manager.load();

            const drops = manager.getCommonDrops(makePlayer(), makeMonster({ polymorphItem: 0 }), 100_000_000, 1);

            expect(drops).to.have.lengthOf(0);
        });

        it('should not append a marble outside the drop table', () => {
            const manager = makeManager({});
            manager.load();

            const drops = manager.getDrops(makePlayer(), makeMonster({ polymorphItem: POLYMORPH_VNUM }));

            expect(
                drops.filter((drop) => (drop.item as any).getType() === ItemTypeEnum.ITEM_POLYMORPH),
                'the marble must come from the table, not from getDrops itself',
            ).to.have.lengthOf(0);
        });
    });

    describe('gold drop chance (issue #157)', () => {
        it('should refuse the gold drop when the computed chance is 0', () => {
            const manager = makeManager();
            const monster = makeMonster({ rank: MobRankEnum.PAWN, level: 1 });

            const gold = manager.getGoldDrop(makePlayer(30), monster);

            expect(gold, 'levelDelta -14 clamps to index 0, so the chance is 0 and must not pay out').to.equal(null);
        });

        it('should not turn a small chance into a certainty', () => {
            const manager = makeManager();
            const monster = makeMonster({ rank: MobRankEnum.PAWN, level: 1 });

            const results = Array.from({ length: 200 }, () => manager.getGoldDrop(makePlayer(30), monster));

            expect(
                results.every((r) => r === null),
                'Math.max(100, percent) made every kill pay gold',
            ).to.be.true;
        });
    });

    describe('level delta table bounds (issue #157)', () => {
        it('should stay inside the table for a monster far above the player', () => {
            const manager = makeManager();
            const { delta } = manager.calcDropPercent(makePlayer(1), makeMonster({ level: 90 }));

            expect(
                Number.isNaN(delta),
                'levelDelta 104 is far past the 31-entry table; an out-of-bounds index yields undefined and poisons the maths',
            ).to.be.false;
            expect(delta).to.be.a('number');
        });
    });
});
