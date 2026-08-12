import { expect } from 'chai';
import sinon from 'sinon';
import Character from '@/core/domain/entities/game/Character';
import PlayerBattleStrategy from '@/core/domain/entities/game/player/delegate/battle/PlayerBattleStrategy';
import MonsterBattle from '@/core/domain/entities/game/mob/delegate/battle/MonsterBattle';
import { PointsEnum } from '@/core/enum/PointsEnum';

/**
 * CalcAttackRating (battle.cpp:211-242) builds the victim-side evade rating
 * from the ATTACKER's level: `int victim_lv = pkAttacker->GetLevel();` at
 * line 227. Both battle directions must feed that level through.
 */

const ratingCall = (proto: unknown, self: unknown, victim: unknown) =>
    (proto as Record<string, (v: unknown) => number>)['calcAttackRating'].call(self, victim);

const makeRealRated = (dx: number, level: number) => ({
    getPoint: (point: PointsEnum) => (point === PointsEnum.DX ? dx : point === PointsEnum.LEVEL ? level : 0),
    getLevel: () => level,
    getAttackRating(level?: number) {
        return Character.prototype.getAttackRating.call(this, level);
    },
});

describe('attack rating level source (both battle directions)', () => {
    it('player vs mob: the mob evade rating is built from the player level', () => {
        const victim = { getAttackRating: sinon.stub().returns(0) };
        const attacker = { getAttackRating: () => 0, getLevel: () => 70 };

        ratingCall(PlayerBattleStrategy.prototype, { attacker }, victim);

        expect(victim.getAttackRating.calledOnceWith(70)).to.equal(true);
    });

    it('mob vs player: the player evade rating is built from the mob level', () => {
        const victim = { getAttackRating: sinon.stub().returns(0) };
        const attacker = { getAttackRating: () => 0, getLevel: () => 35 };

        ratingCall(MonsterBattle.prototype, { attacker }, victim);

        expect(victim.getAttackRating.calledOnceWith(35)).to.equal(true);
    });

    it('reproduces the original arithmetic end to end', () => {
        // attacker: dx 90, level 70 -> iARSrc = min(90, (360 + 140) / 6) = 83
        // victim:   dx 30, attacker level 70 -> iERSrc = (120 + 140) / 6 = 43
        // fAR = (83 + 210) / 300, fER = ((43 * 2 + 5) / (43 + 95)) * 3 / 10
        const attacker = makeRealRated(90, 70);
        const victim = makeRealRated(30, 5);

        const rating = ratingCall(PlayerBattleStrategy.prototype, { attacker }, victim);

        const expected = (83 + 210) / 300 - ((43 * 2 + 5) / (43 + 95)) * (3 / 10);
        expect(rating).to.be.closeTo(expected, 1e-9);
    });
});
