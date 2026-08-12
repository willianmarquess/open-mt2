import { expect } from 'chai';
import { PlayerPoints } from '@/core/domain/entities/game/player/delegate/PlayerPoints';
import { PointsEnum } from '@/core/enum/PointsEnum';

const HORSE_SKILL_POINTS = 7;
const HORSE_LEVEL = 21;

const createPoints = () =>
    new PlayerPoints({ horseSkill: HORSE_SKILL_POINTS } as any, {
        config: {} as any,
        player: { getHorseLevel: () => HORSE_LEVEL } as any,
    });

describe('PlayerPoints — horse skill point registration (issue #206)', () => {
    it('should read the riding point pool, not the horse level', () => {
        const points = createPoints();

        expect(points.getPoint(PointsEnum.HORSE_SKILL)).to.equal(HORSE_SKILL_POINTS);
    });

    it('should spend and grant riding points instead of silently ignoring the change', () => {
        const points = createPoints();

        points.addPoint(PointsEnum.HORSE_SKILL, -1);
        expect(points.getPoint(PointsEnum.HORSE_SKILL)).to.equal(HORSE_SKILL_POINTS - 1);

        points.addPoint(PointsEnum.HORSE_SKILL, 3);
        expect(points.getPoint(PointsEnum.HORSE_SKILL)).to.equal(HORSE_SKILL_POINTS + 2);

        points.setPoint(PointsEnum.HORSE_SKILL, 0);
        expect(points.getPoint(PointsEnum.HORSE_SKILL)).to.equal(0);
    });
});
