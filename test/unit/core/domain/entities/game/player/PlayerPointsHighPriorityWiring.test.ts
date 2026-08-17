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

describe('PlayerPoints previously-unwired high priority points', () => {
    // These used to be no-ops: the class had the field + constructor plumbing, but no points.set()
    // registration, so addPoint()/getPoint() silently did nothing for every skill/item targeting one.
    const simplePoints: Array<PointsEnum> = [
        PointsEnum.CASTING_SPEED,
        PointsEnum.BOW_DISTANCE,
        PointsEnum.ATTBONUS_HUMAN,
        PointsEnum.ATTBONUS_ANIMAL,
        PointsEnum.ATTBONUS_ORC,
        PointsEnum.ATTBONUS_MILGYO,
        PointsEnum.ATTBONUS_UNDEAD,
        PointsEnum.ATTBONUS_DEVIL,
        PointsEnum.ATTBONUS_INSECT,
        PointsEnum.ATTBONUS_FIRE,
        PointsEnum.ATTBONUS_ICE,
        PointsEnum.ATTBONUS_DESERT,
        PointsEnum.ATTBONUS_MONSTER,
        PointsEnum.ATTBONUS_TREE,
        PointsEnum.POISON_REDUCE,
        PointsEnum.EXP_DOUBLE_BONUS,
        PointsEnum.POTION_BONUS,
        PointsEnum.IMMUNE_STUN,
        PointsEnum.PARTY_ATTACKER_BONUS,
        PointsEnum.RESIST_NORMAL_DAMAGE,
        PointsEnum.MANASHIELD,
        PointsEnum.MALL_ATTBONUS,
        PointsEnum.SKILL_DAMAGE_BONUS,
        PointsEnum.NORMAL_HIT_DAMAGE_BONUS,
        PointsEnum.SKILL_DEFEND_BONUS,
        PointsEnum.NORMAL_HIT_DEFEND_BONUS,
        PointsEnum.MAGIC_ATT_BONUS_PER,
        PointsEnum.MELEE_MAGIC_ATT_BONUS_PER,
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

    it('folds MAX_HP_PCT into MAX_HEALTH as a percentage bonus on top of the base, capped at 3500', () => {
        const points = makePoints();
        points.calcPointsAndResetValues();
        const baseMaxHealth = points.getPoint(PointsEnum.MAX_HEALTH);

        points.addPoint(PointsEnum.MAX_HP_PCT, 50);

        expect(points.getPoint(PointsEnum.MAX_HEALTH)).to.equal(baseMaxHealth + baseMaxHealth * 0.5);
    });

    it('caps the MAX_HP_PCT bonus at 3500, matching char.cpp:3160', () => {
        const points = makePoints();
        points.calcPointsAndResetValues();
        const baseMaxHealth = points.getPoint(PointsEnum.MAX_HEALTH);

        points.addPoint(PointsEnum.MAX_HP_PCT, 100_000);

        expect(points.getPoint(PointsEnum.MAX_HEALTH)).to.equal(baseMaxHealth + 3500);
    });
});
