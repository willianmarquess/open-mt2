import { expect } from 'chai';
import { PlayerPoints } from '@/core/domain/entities/game/player/delegate/PlayerPoints';
import { PointsEnum } from '@/core/enum/PointsEnum';

const RESIST = 30;

const createPoints = () =>
    new PlayerPoints({ resistMagic: RESIST, resistBow: RESIST } as any, { config: {} as any, player: {} as any });

describe('PlayerPoints — resist magic registration (issue #51)', () => {
    it('should expose resist magic through getPoint, the way resist bow already is', () => {
        const points = createPoints();

        expect(points.getPoint(PointsEnum.RESIST_MAGIC), 'an unregistered point reads 0').to.equal(RESIST);
        expect(points.getPoint(PointsEnum.RESIST_BOW)).to.equal(RESIST);
    });
});
