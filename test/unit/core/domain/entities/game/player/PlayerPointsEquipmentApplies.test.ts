import { expect } from 'chai';
import { PlayerPoints } from '@/core/domain/entities/game/player/delegate/PlayerPoints';
import { PointsEnum } from '@/core/enum/PointsEnum';

const BASE = { st: 60, ht: 55, dx: 50, iq: 45 };

const makePoints = () => {
    const player: any = {
        isHorseRiding: () => false,
        getHorseLevel: () => 0,
        isAffectByFlag: () => false,
        getPolymorphVnum: () => 0,
        getWeaponValues: () => ({
            physic: { min: 0, max: 0, bonus: 0 },
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
        } as any,
        {
            config: { MAX_POINTS: 90, MAX_LEVEL: 99, POINTS_PER_LEVEL: 3 } as any,
            experienceManager: { getNeededExperience: () => 1000 } as any,
            player,
            mobManager: { getMobProto: () => ({ st: 20, ht: 20, dx: 20, iq: 20 }) } as any,
        } as any,
    );
};

describe('PlayerPoints equip/unequip bonuses (PlayerApplies phase 1)', () => {
    it('folds a MAX_HEALTH addPoint as a flat +N HP item bonus (APPLY_MAX_HP, char.cpp:3558)', () => {
        const points = makePoints();
        points.calcPointsAndResetValues();
        const before = points.getPoint(PointsEnum.MAX_HEALTH);

        points.addPoint(PointsEnum.MAX_HEALTH, 100);
        expect(points.getPoint(PointsEnum.MAX_HEALTH)).to.equal(before + 100);

        // Unequipping removes it again, matching PlayerApplies.removeItemApplies negating the value.
        points.addPoint(PointsEnum.MAX_HEALTH, -100);
        expect(points.getPoint(PointsEnum.MAX_HEALTH)).to.equal(before);
    });

    it('folds a MAX_MANA addPoint as a flat +N SP item bonus (APPLY_MAX_SP)', () => {
        const points = makePoints();
        points.calcPointsAndResetValues();
        const before = points.getPoint(PointsEnum.MAX_MANA);

        points.addPoint(PointsEnum.MAX_MANA, 50);
        expect(points.getPoint(PointsEnum.MAX_MANA)).to.equal(before + 50);

        points.addPoint(PointsEnum.MAX_MANA, -50);
        expect(points.getPoint(PointsEnum.MAX_MANA)).to.equal(before);
    });

    it('survives a stat-triggered recompute (equip HT/IQ gear, then MAX_HEALTH/MAX_MANA item bonus stays folded in)', () => {
        const points = makePoints();
        points.calcPointsAndResetValues();

        points.addPoint(PointsEnum.MAX_HEALTH, 100);
        const withBonus = points.getPoint(PointsEnum.MAX_HEALTH);

        points.addPoint(PointsEnum.HT, 5); // e.g. equipping a CON item, re-triggers calcMaxHealth

        expect(points.getPoint(PointsEnum.MAX_HEALTH)).to.be.greaterThan(withBonus - 1); // bonus not lost
        expect(points.getPoint(PointsEnum.MAX_HEALTH)).to.be.greaterThan(withBonus - 0.0001);
    });

    // Weapon-type/magic resists and reflect melee used to be get-only (fine for a fixed mob_proto
    // value, but a Player's only source for these is equipped items).
    const nowAddablePoints: Array<PointsEnum> = [
        PointsEnum.RESIST_SWORD,
        PointsEnum.RESIST_TWOHAND,
        PointsEnum.RESIST_DAGGER,
        PointsEnum.RESIST_BELL,
        PointsEnum.RESIST_FAN,
        PointsEnum.RESIST_BOW,
        PointsEnum.RESIST_MAGIC,
        PointsEnum.REFLECT_MELEE,
    ];

    nowAddablePoints.forEach((point) => {
        it(`${PointsEnum[point]} is addable now (item equip/unequip), not just readable`, () => {
            const points = makePoints();

            expect(points.getPoint(point)).to.equal(0);

            points.addPoint(point, 20);
            expect(points.getPoint(point)).to.equal(20);

            points.addPoint(point, -20);
            expect(points.getPoint(point)).to.equal(0);
        });
    });

    // RESIST_ICE/EARTH/DARK: brand new PointsEnum entries (133-135, char.h:283-285) - no original
    // consumer wired to read them yet either (same as RESIST_FIRE/ELEC/WIND before them), but the
    // plumbing needs to exist for APPLY_RESIST_ICE/EARTH/DARK items to do anything at all.
    const newElementalResists: Array<PointsEnum> = [
        PointsEnum.RESIST_ICE,
        PointsEnum.RESIST_EARTH,
        PointsEnum.RESIST_DARK,
    ];

    newElementalResists.forEach((point) => {
        it(`${PointsEnum[point]} round-trips through addPoint/getPoint`, () => {
            const points = makePoints();

            expect(points.getPoint(point)).to.equal(0);

            points.addPoint(point, 15);
            expect(points.getPoint(point)).to.equal(15);
        });
    });

    it('MAX_STAMINA is addable now, with no recompute to wipe it (no calcMaxStamina exists)', () => {
        const points = makePoints();

        points.addPoint(PointsEnum.MAX_STAMINA, 10);
        expect(points.getPoint(PointsEnum.MAX_STAMINA)).to.equal(10);
    });
});
