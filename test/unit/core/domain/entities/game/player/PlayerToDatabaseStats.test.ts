import { expect } from 'chai';
import Player from '@/core/domain/entities/game/player/Player';
import { PointsEnum } from '@/core/enum/PointsEnum';

const BASE = { st: 60, ht: 55, dx: 50, iq: 45 };
const HORSE = { st: 26, ht: 18, dx: 35, iq: 9 };

const statOf = (source: Record<string, number>, point: PointsEnum) => {
    switch (point) {
        case PointsEnum.ST:
            return source.st;
        case PointsEnum.HT:
            return source.ht;
        case PointsEnum.DX:
            return source.dx;
        case PointsEnum.IQ:
            return source.iq;
        default:
            return 0;
    }
};

const mountedPlayer = () =>
    ({
        id: 1,
        accountId: 1,
        empire: 1,
        playerClass: 0,
        skillGroup: 0,
        positionX: 0,
        positionY: 0,
        name: 'Test',
        slot: 0,
        quickSlot: new Map(),
        horse: { isTemporaryRiding: () => false },
        points: {
            getPoint: (point: PointsEnum) => statOf(HORSE, point),
            getPersistedStat: (point: PointsEnum) => statOf(BASE, point),
            getGivenStatusPoints: () => 0,
        },
        skills: {
            getSkills: () => [],
        },
        calcPlayTime: () => 0,
        getBody: () => null,
        getHair: () => null,
        getHorseLevel: () => 1,
        getHorseHealth: () => 1,
        getHorseStamina: () => 1,
        getHorseName: () => '',
        isHorseRiding: () => true,
    }) as unknown as Player;

describe('Player.toDatabase while mounted (issue #167)', () => {
    it('should persist the character stats rather than the horse stats', () => {
        const state = Player.prototype.toDatabase.call(mountedPlayer()) as any;

        expect(state.st, 'a level 1 horse would overwrite a 60 ST character with 26').to.equal(BASE.st);
        expect(state.ht).to.equal(BASE.ht);
        expect(state.dx).to.equal(BASE.dx);
        expect(state.iq).to.equal(BASE.iq);
    });

    it('should still take everything else from the live points', () => {
        const state = Player.prototype.toDatabase.call(mountedPlayer()) as any;

        expect(state.horseLevel).to.equal(1);
        expect(state.horseRiding).to.equal(1);
    });
});
