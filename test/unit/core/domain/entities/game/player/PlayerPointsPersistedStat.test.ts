import { expect } from 'chai';
import { PlayerPoints } from '@/core/domain/entities/game/player/delegate/PlayerPoints';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';
import { HORSE_STATS } from '@/core/domain/entities/game/horse/HorseStats';

const BASE = { st: 60, ht: 55, dx: 50, iq: 45 };

const makePoints = ({
    riding = false,
    horseLevel = 0,
    polymorphVnum = 0,
}: { riding?: boolean; horseLevel?: number; polymorphVnum?: number } = {}) => {
    const player: any = {
        isHorseRiding: () => riding,
        getHorseLevel: () => horseLevel,
        isAffectByFlag: (flag: AffectBitsTypeEnum) => flag === AffectBitsTypeEnum.POLYMORPH && polymorphVnum > 0,
        getPolymorphVnum: () => polymorphVnum,
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

describe('PlayerPoints.getPersistedStat (issue #167)', () => {
    it('should report the character stats, not the horse, while riding', () => {
        const horse = HORSE_STATS[1];
        const points = makePoints({ riding: true, horseLevel: 1 });

        expect(points.getPoint(PointsEnum.ST), 'combat still sees the horse').to.equal(horse.st);
        expect(points.getPersistedStat(PointsEnum.ST), 'persistence must see the character').to.equal(BASE.st);
        expect(points.getPersistedStat(PointsEnum.HT)).to.equal(BASE.ht);
        expect(points.getPersistedStat(PointsEnum.DX)).to.equal(BASE.dx);
        expect(points.getPersistedStat(PointsEnum.IQ)).to.equal(BASE.iq);
    });

    it('should not include the polymorph bonus', () => {
        const points = makePoints({ polymorphVnum: 101 });

        expect(points.getPoint(PointsEnum.ST), 'combat still sees the bonus').to.equal(BASE.st + 20);
        expect(points.getPersistedStat(PointsEnum.ST)).to.equal(BASE.st);
    });

    it('should agree with the effective stat when nothing is modifying it', () => {
        const points = makePoints();

        for (const point of [PointsEnum.ST, PointsEnum.HT, PointsEnum.DX, PointsEnum.IQ]) {
            expect(points.getPersistedStat(point)).to.equal(points.getPoint(point));
        }
    });
});
