import { expect } from 'chai';
import { PlayerPoints } from '@/core/domain/entities/game/player/delegate/PlayerPoints';
import { PointsEnum } from '@/core/enum/PointsEnum';

const BASE = { st: 60, ht: 55, dx: 50, iq: 45 };

const makePoints = (level = 1, group = 1) => {
    const player: any = {
        getSkillGroup: () => group,
        getPlayerClass: () => 0,
        levelUp: () => {},
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
            level,
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
            config: { MAX_POINTS: 90, MAX_LEVEL: 99, POINTS_PER_LEVEL: 3, jobs: { warrior: { common: BASE } } } as any,
            experienceManager: { getNeededExperience: () => 1000 } as any,
            player,
            mobManager: { getMobProto: () => ({ st: 20, ht: 20, dx: 20, iq: 20 }) } as any,
        } as any,
    );
};

describe('Sub-skill point grants (#209)', () => {
    for (const [oldLevel, newLevel, balance, expected] of [
        [1, 50, 0, 41],
        [50, 50, 7, 7],
        [50, 51, 7, 8],
        [9, 10, 0, 1],
        [50, 40, 12, 2],
        [50, 40, 2, 0],
        [10, 9, 2, 2],
        [10, 0, 2, 2],
        [10, 100, 2, 2],
    ]) {
        it(`sets level ${oldLevel} -> ${newLevel} with balance ${balance} -> ${expected}`, () => {
            const points = makePoints(oldLevel);
            points.setPoint(PointsEnum.SUB_SKILL, balance);
            points.setPoint(PointsEnum.LEVEL, newLevel);
            expect(points.getPoint(PointsEnum.SUB_SKILL)).to.equal(expected);
        });
    }
    for (const [level, group, experience, expectedLevel, expected] of [
        [8, 1, 1000, 9, 0],
        [9, 1, 1000, 10, 1],
        [9, 0, 1000, 10, 0],
        [8, 1, 4000, 12, 3],
    ]) {
        it(`levels naturally from ${level}, group ${group}, EXP ${experience}`, () => {
            const points = makePoints(level, group);
            points.addPoint(PointsEnum.EXPERIENCE, experience);
            expect(points.getPoint(PointsEnum.LEVEL)).to.equal(expectedLevel);
            expect(points.getPoint(PointsEnum.SUB_SKILL)).to.equal(expected);
        });
    }
});
