import { expect } from 'chai';
import { PlayerPoints } from '@/core/domain/entities/game/player/delegate/PlayerPoints';
import { PointsEnum } from '@/core/enum/PointsEnum';

const BASE = { st: 60, ht: 55, dx: 50, iq: 45 };

const makePoints = (overrides: Record<string, unknown> = {}) => {
    const player: any = {
        isHorseRiding: () => false,
        getHorseLevel: () => 0,
        isAffectByFlag: () => false,
        getPolymorphVnum: () => 0,
        getWeaponValues: () => ({
            physic: { min: 12, max: 34, bonus: 0 },
            magic: { min: 0, max: 0, bonus: 0 },
        }),
        getArmorValues: () => [],
    };

    return new PlayerPoints(
        {
            ...BASE,
            level: 30,
            experience: 0,
            health: 100,
            mana: 100,
            stamina: 100,
            gold: 0,
            givenStatusPoints: 0,
            availableStatusPoints: 0,
            hpPerLvl: 1,
            hpPerHtPoint: 1,
            mpPerLvl: 1,
            mpPerIqPoint: 1,
            baseHealth: 100,
            baseMana: 100,
            defensePerHtPoint: 1,
            attackPerStPoint: 1,
            attackPerDxPoint: 1,
            attackPerIqPoint: 1,
            baseAttackSpeed: 100,
            baseMovementSpeed: 100,
            ...overrides,
        } as any,
        {
            config: { MAX_POINTS: 90, MAX_LEVEL: 99, POINTS_PER_LEVEL: 3 } as any,
            experienceManager: { getNeededExperience: () => 1000 } as any,
            player,
            mobManager: { getMobProto: () => ({ st: 20, ht: 20, dx: 20, iq: 20 }) } as any,
        } as any,
    );
};

describe('PlayerPoints remaining (low-priority) wiring', () => {
    const simplePoints: Array<PointsEnum> = [
        PointsEnum.EMPIRE_POINT,
        PointsEnum.LEVEL_STEP,
        PointsEnum.MIN_ATTACK_DAMAGE,
        PointsEnum.MAX_ATTACK_DAMAGE,
        PointsEnum.CURSE,
        PointsEnum.ATTBONUS_WARRIOR,
        PointsEnum.ATTBONUS_ASSASSIN,
        PointsEnum.ATTBONUS_SURA,
        PointsEnum.ATTBONUS_SHAMAN,
        PointsEnum.RESIST_WARRIOR,
        PointsEnum.RESIST_ASSASSIN,
        PointsEnum.RESIST_SURA,
        PointsEnum.RESIST_SHAMAN,
        PointsEnum.MANA_BURN_PCT,
        PointsEnum.DAMAGE_SP_RECOVER,
        PointsEnum.RESIST_FIRE,
        PointsEnum.RESIST_ELEC,
        PointsEnum.RESIST_WIND,
        PointsEnum.REFLECT_CURSE,
        PointsEnum.KILL_SP_RECOVER,
        PointsEnum.GOLD_DOUBLE_BONUS,
        PointsEnum.KILL_HP_RECOVERY,
        PointsEnum.IMMUNE_SLOW,
        PointsEnum.IMMUNE_FALL,
        PointsEnum.PARTY_BUFFER_BONUS,
        PointsEnum.HP_RECOVER_CONTINUE,
        PointsEnum.SP_RECOVER_CONTINUE,
        PointsEnum.PARTY_HASTE_BONUS,
        PointsEnum.PARTY_DEFENDER_BONUS,
        PointsEnum.STAT_RESET_COUNT,
        PointsEnum.MALL_DEFBONUS,
        PointsEnum.MALL_EXPBONUS,
        PointsEnum.MALL_GOLDBONUS,
        PointsEnum.PC_BANG_EXP_BONUS,
        PointsEnum.PC_BANG_DROP_BONUS,
        PointsEnum.RAMADAN_CANDY_BONUS_EXP,
        PointsEnum.ENERGY,
        PointsEnum.ENERGY_END_TIME,
        PointsEnum.COSTUME_ATTR_BONUS,
        PointsEnum.RESIST_CRITICAL,
        PointsEnum.RESIST_PENETRATE,
    ];

    simplePoints.forEach((point) => {
        it(`${PointsEnum[point]} round-trips through addPoint/getPoint instead of no-oping`, () => {
            const points = makePoints();

            expect(points.getPoint(point), 'should start at 0').to.equal(0);

            points.addPoint(point, 25);
            expect(points.getPoint(point)).to.equal(25);

            points.addPoint(point, -10);
            expect(points.getPoint(point)).to.equal(15);
        });
    });

    it('STAT_RESET_COUNT also supports setPoint, matching the SKILL/SUB_SKILL pattern', () => {
        const points = makePoints();

        points.setPoint(PointsEnum.STAT_RESET_COUNT, 12);

        expect(points.getPoint(PointsEnum.STAT_RESET_COUNT)).to.equal(12);
    });

    it('ENERGY_END_TIME also supports setPoint', () => {
        const points = makePoints();

        points.setPoint(PointsEnum.ENERGY_END_TIME, 123456);

        expect(points.getPoint(PointsEnum.ENERGY_END_TIME)).to.equal(123456);
    });

    it('MAX_STAMINA reads the persisted base value (get-only, mirrors MAX_HEALTH/MAX_MANA)', () => {
        const points = makePoints();

        expect(points.getPoint(PointsEnum.MAX_STAMINA)).to.equal(0);
    });

    it('MIN_WEAPON_DAMAGE/MAX_WEAPON_DAMAGE read straight off the equipped weapon', () => {
        const points = makePoints();

        expect(points.getPoint(PointsEnum.MIN_WEAPON_DAMAGE)).to.equal(12);
        expect(points.getPoint(PointsEnum.MAX_WEAPON_DAMAGE)).to.equal(34);
    });

    it('folds PARTY_TANKER_BONUS into MAX_HEALTH as a flat addition (char.cpp:3162)', () => {
        const points = makePoints();
        points.calcPointsAndResetValues();
        const before = points.getPoint(PointsEnum.MAX_HEALTH);

        points.addPoint(PointsEnum.PARTY_TANKER_BONUS, 200);

        expect(points.getPoint(PointsEnum.MAX_HEALTH)).to.equal(before + 200);
    });

    it('folds PARTY_SKILL_MASTER_BONUS into MAX_MANA as a flat addition (char.cpp:3179)', () => {
        const points = makePoints();
        points.calcPointsAndResetValues();
        const before = points.getPoint(PointsEnum.MAX_MANA);

        points.addPoint(PointsEnum.PARTY_SKILL_MASTER_BONUS, 150);

        expect(points.getPoint(PointsEnum.MAX_MANA)).to.equal(before + 150);
    });

    it('folds MAX_SP_PCT into MAX_MANA as a percentage bonus, capped at 800 (char.cpp:3177)', () => {
        const points = makePoints();
        points.calcPointsAndResetValues();
        const before = points.getPoint(PointsEnum.MAX_MANA);

        points.addPoint(PointsEnum.MAX_SP_PCT, 50);
        expect(points.getPoint(PointsEnum.MAX_MANA)).to.equal(before + before * 0.5);

        points.addPoint(PointsEnum.MAX_SP_PCT, 100_000);
        expect(points.getPoint(PointsEnum.MAX_MANA)).to.equal(before + 800);
    });
});
