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

describe('PlayerPoints ATT_GRADE_BONUS/DEF_GRADE_BONUS (Aura of Sword not raising attack)', () => {
    it('folds ATT_GRADE_BONUS into ATTACK_GRADE instead of getting wiped by the next recompute', () => {
        const points = makePoints();
        points.calcPointsAndResetValues();
        const before = points.getPoint(PointsEnum.ATTACK_GRADE);

        points.addPoint(PointsEnum.ATT_GRADE_BONUS, 500);

        expect(points.getPoint(PointsEnum.ATTACK_GRADE)).to.equal(before + 500);

        // A stat change re-triggers calcAttack() from scratch - the bonus must survive that too,
        // matching ComputePoints folding GetPoint(POINT_ATT_GRADE_BONUS) back in every time
        // (char.cpp:2056-2058), not just on the first add.
        points.addPoint(PointsEnum.DX, 1);

        expect(points.getPoint(PointsEnum.ATTACK_GRADE)).to.equal(before + 500 + 1);
    });

    it('removing the ATT_GRADE_BONUS (skill/affect expiring) drops ATTACK_GRADE back down', () => {
        const points = makePoints();
        points.calcPointsAndResetValues();
        const before = points.getPoint(PointsEnum.ATTACK_GRADE);

        points.addPoint(PointsEnum.ATT_GRADE_BONUS, 500);
        points.addPoint(PointsEnum.ATT_GRADE_BONUS, -500);

        expect(points.getPoint(PointsEnum.ATTACK_GRADE)).to.equal(before);
    });

    it('folds DEF_GRADE_BONUS into DEFENSE_GRADE the same way, for defensive auras (Strong Body/Enchanted Armour/Dark Protection)', () => {
        const points = makePoints();
        points.calcPointsAndResetValues();
        const before = points.getPoint(PointsEnum.DEFENSE_GRADE);

        points.addPoint(PointsEnum.DEF_GRADE_BONUS, 300);

        expect(points.getPoint(PointsEnum.DEFENSE_GRADE)).to.equal(before + 300);
    });

    it('does not double-count ATTACK_BONUS as a flat term on top of its own battle-time percentage multiplier', () => {
        const points = makePoints();
        points.calcPointsAndResetValues();
        const before = points.getPoint(PointsEnum.ATTACK_GRADE);

        points.addPoint(PointsEnum.ATTACK_BONUS, 50);

        // ATTACK_BONUS (POINT_ATT_BONUS) is only ever applied as a % multiplier at damage-calc time
        // (battle.cpp:453,571) - it must not also shift the base ATTACK_GRADE.
        expect(points.getPoint(PointsEnum.ATTACK_GRADE)).to.equal(before);
        expect(points.getPoint(PointsEnum.ATTACK_BONUS)).to.equal(50);
    });
});
