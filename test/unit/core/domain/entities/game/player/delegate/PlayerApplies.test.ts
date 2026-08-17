import Item from '@/core/domain/entities/game/item/Item';
import PlayerApplies from '@/core/domain/entities/game/player/delegate/PlayerApplies';
import { ApplyTypeEnum } from '@/core/enum/ApplyTypeEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { expect } from 'chai';
import sinon from 'sinon';

describe('PlayerApplies', function () {
    let playerMock;
    let loggerMock;
    let playerApplies: PlayerApplies;

    beforeEach(function () {
        playerMock = {
            addPoint: sinon.spy(),
        };

        loggerMock = {
            debug: sinon.spy(),
        };

        playerApplies = new PlayerApplies(playerMock, loggerMock);
    });

    describe('addItemApplies', function () {
        it('should apply valid item effects to the player', function () {
            const item = {
                getApplies: () => [
                    { type: ApplyTypeEnum.ATT_SPEED, value: 10 },
                    { type: ApplyTypeEnum.MOV_SPEED, value: 5 },
                ],
            } as unknown as Item;

            playerApplies.addItemApplies(item);

            expect(playerMock.addPoint.firstCall.args[1]).to.be.equal(10);
            expect(playerMock.addPoint.secondCall.args[1]).to.be.equal(5);
        });

        it('should log debug message for unimplemented applies', function () {
            const item = {
                getApplies: () => [{ type: 'UNKNOWN_TYPE', value: 15 }],
            } as unknown as Item;

            playerApplies.addItemApplies(item);

            expect(loggerMock.debug.calledOnce).to.be.true;
            expect(loggerMock.debug.firstCall.args[0]).to.include('Apply not implemented yet: UNKNOWN_TYPE');
        });
    });

    describe('removeItemApplies', function () {
        it('should remove valid item effects from the player', function () {
            const item = {
                getApplies: () => [
                    { type: ApplyTypeEnum.HP_REGEN, value: 8 },
                    { type: ApplyTypeEnum.SP_REGEN, value: 12 },
                ],
            } as unknown as Item;

            playerApplies.removeItemApplies(item);

            expect(playerMock.addPoint.firstCall.args[1]).to.be.equal(-8);
            expect(playerMock.addPoint.secondCall.args[1]).to.be.equal(-12);
        });

        it('should log debug message for unimplemented applies', function () {
            const item = {
                getApplies: () => [{ type: 'UNKNOWN_TYPE', value: 20 }],
            } as unknown as Item;

            playerApplies.removeItemApplies(item);

            expect(loggerMock.debug.calledOnce).to.be.true;
            expect(loggerMock.debug.firstCall.args[0]).to.include('Apply not implemented yet: UNKNOWN_TYPE');
        });
    });

    describe('main attribute applies (phase 1: char.cpp:3556-3646)', () => {
        // Every entry that maps 1:1 by name (STR->ST, RESIST_SWORD->RESIST_SWORD, ...), mirroring the
        // original's generic `PointChange(aApplyInfo[bApplyType].bPointType, iVal)` fallthrough.
        const directMappings: Array<[ApplyTypeEnum, PointsEnum]> = [
            [ApplyTypeEnum.STR, PointsEnum.ST],
            [ApplyTypeEnum.DEX, PointsEnum.DX],
            [ApplyTypeEnum.MAX_HP_PCT, PointsEnum.MAX_HP_PCT],
            [ApplyTypeEnum.MAX_SP_PCT, PointsEnum.MAX_SP_PCT],
            [ApplyTypeEnum.CAST_SPEED, PointsEnum.CASTING_SPEED],
            [ApplyTypeEnum.SLOW_PCT, PointsEnum.SLOW_CHANCE],
            [ApplyTypeEnum.BLOCK, PointsEnum.BLOCK],
            [ApplyTypeEnum.DODGE, PointsEnum.DODGE],
            [ApplyTypeEnum.RESIST_SWORD, PointsEnum.RESIST_SWORD],
            [ApplyTypeEnum.RESIST_TWOHAND, PointsEnum.RESIST_TWOHAND],
            [ApplyTypeEnum.RESIST_DAGGER, PointsEnum.RESIST_DAGGER],
            [ApplyTypeEnum.RESIST_BELL, PointsEnum.RESIST_BELL],
            [ApplyTypeEnum.RESIST_FAN, PointsEnum.RESIST_FAN],
            [ApplyTypeEnum.RESIST_BOW, PointsEnum.RESIST_BOW],
            [ApplyTypeEnum.RESIST_FIRE, PointsEnum.RESIST_FIRE],
            [ApplyTypeEnum.RESIST_ELEC, PointsEnum.RESIST_ELEC],
            [ApplyTypeEnum.RESIST_MAGIC, PointsEnum.RESIST_MAGIC],
            [ApplyTypeEnum.RESIST_WIND, PointsEnum.RESIST_WIND],
            [ApplyTypeEnum.REFLECT_MELEE, PointsEnum.REFLECT_MELEE],
            [ApplyTypeEnum.REFLECT_CURSE, PointsEnum.REFLECT_CURSE],
            [ApplyTypeEnum.ATT_GRADE_BONUS, PointsEnum.ATT_GRADE_BONUS],
            [ApplyTypeEnum.DEF_GRADE_BONUS, PointsEnum.DEF_GRADE_BONUS],
        ];

        directMappings.forEach(([applyType, pointsEnum]) => {
            it(`${ApplyTypeEnum[applyType]} adds to ${PointsEnum[pointsEnum]}`, () => {
                const item = { getApplies: () => [{ type: applyType, value: 42 }] } as unknown as Item;

                playerApplies.addItemApplies(item);

                expect(playerMock.addPoint.calledOnceWith(pointsEnum, 42)).to.be.true;
            });
        });

        // char.cpp:3519-3528: CON/INT feed HT/IQ directly - MAX_HEALTH/MAX_MANA follow automatically
        // through HT/IQ's own afterAddHooks (PlayerPoints), so no separate MAX_HP/MAX_SP add is needed
        // here (that would double-count it).
        it('CON adds to HT, not directly to MAX_HEALTH', () => {
            const item = { getApplies: () => [{ type: ApplyTypeEnum.CON, value: 5 }] } as unknown as Item;

            playerApplies.addItemApplies(item);

            expect(playerMock.addPoint.calledOnceWith(PointsEnum.HT, 5)).to.be.true;
        });

        it('INT adds to IQ, not directly to MAX_MANA', () => {
            const item = { getApplies: () => [{ type: ApplyTypeEnum.INT, value: 5 }] } as unknown as Item;

            playerApplies.addItemApplies(item);

            expect(playerMock.addPoint.calledOnceWith(PointsEnum.IQ, 5)).to.be.true;
        });

        it('MAX_HP adds straight to MAX_HEALTH as a flat item bonus', () => {
            const item = { getApplies: () => [{ type: ApplyTypeEnum.MAX_HP, value: 100 }] } as unknown as Item;

            playerApplies.addItemApplies(item);

            expect(playerMock.addPoint.calledOnceWith(PointsEnum.MAX_HEALTH, 100)).to.be.true;
        });

        it('MAX_SP adds straight to MAX_MANA as a flat item bonus', () => {
            const item = { getApplies: () => [{ type: ApplyTypeEnum.MAX_SP, value: 50 }] } as unknown as Item;

            playerApplies.addItemApplies(item);

            expect(playerMock.addPoint.calledOnceWith(PointsEnum.MAX_MANA, 50)).to.be.true;
        });

        // The one recurring exception to the 1:1 mapping: *_GRADE apply types target the *_BONUS
        // point, because the raw grade is fully recomputed from scratch on every stat/gear change.
        it('MAGIC_ATT_GRADE redirects to MAGIC_ATT_GRADE_BONUS, not the recomputed MAGIC_ATT_GRADE', () => {
            const item = { getApplies: () => [{ type: ApplyTypeEnum.MAGIC_ATT_GRADE, value: 30 }] } as unknown as Item;

            playerApplies.addItemApplies(item);

            expect(playerMock.addPoint.calledOnceWith(PointsEnum.MAGIC_ATT_GRADE_BONUS, 30)).to.be.true;
        });

        it('MAGIC_DEF_GRADE redirects to MAGIC_DEF_GRADE_BONUS, not the recomputed MAGIC_DEF_GRADE', () => {
            const item = { getApplies: () => [{ type: ApplyTypeEnum.MAGIC_DEF_GRADE, value: 30 }] } as unknown as Item;

            playerApplies.addItemApplies(item);

            expect(playerMock.addPoint.calledOnceWith(PointsEnum.MAGIC_DEF_GRADE_BONUS, 30)).to.be.true;
        });

        it('unequipping (removeItemApplies) negates the same mapped point', () => {
            const item = { getApplies: () => [{ type: ApplyTypeEnum.MAGIC_ATT_GRADE, value: 30 }] } as unknown as Item;

            playerApplies.removeItemApplies(item);

            expect(playerMock.addPoint.calledOnceWith(PointsEnum.MAGIC_ATT_GRADE_BONUS, -30)).to.be.true;
        });
    });

    describe('remaining applies (phase 2: constants.cpp:526-635)', () => {
        // Every entry verified 1:1 against the aApplyInfo table, including the ones that keep a
        // different name on each side (STEAL_HP->STEAL_HEALTH, CURSE_PCT->CURSE, ANTI_*_PCT->RESIST_*).
        const directMappings: Array<[ApplyTypeEnum, PointsEnum]> = [
            [ApplyTypeEnum.ATTBONUS_HUMAN, PointsEnum.ATTBONUS_HUMAN],
            [ApplyTypeEnum.ATTBONUS_ANIMAL, PointsEnum.ATTBONUS_ANIMAL],
            [ApplyTypeEnum.ATTBONUS_ORC, PointsEnum.ATTBONUS_ORC],
            [ApplyTypeEnum.ATTBONUS_MILGYO, PointsEnum.ATTBONUS_MILGYO],
            [ApplyTypeEnum.ATTBONUS_UNDEAD, PointsEnum.ATTBONUS_UNDEAD],
            [ApplyTypeEnum.ATTBONUS_DEVIL, PointsEnum.ATTBONUS_DEVIL],
            [ApplyTypeEnum.ATTBONUS_WARRIOR, PointsEnum.ATTBONUS_WARRIOR],
            [ApplyTypeEnum.ATTBONUS_ASSASSIN, PointsEnum.ATTBONUS_ASSASSIN],
            [ApplyTypeEnum.ATTBONUS_SURA, PointsEnum.ATTBONUS_SURA],
            [ApplyTypeEnum.ATTBONUS_SHAMAN, PointsEnum.ATTBONUS_SHAMAN],
            [ApplyTypeEnum.ATTBONUS_MONSTER, PointsEnum.ATTBONUS_MONSTER],
            [ApplyTypeEnum.STEAL_HP, PointsEnum.STEAL_HEALTH],
            [ApplyTypeEnum.STEAL_SP, PointsEnum.STEAL_MANA],
            [ApplyTypeEnum.MANA_BURN_PCT, PointsEnum.MANA_BURN_PCT],
            [ApplyTypeEnum.DAMAGE_SP_RECOVER, PointsEnum.DAMAGE_SP_RECOVER],
            [ApplyTypeEnum.RESIST_ICE, PointsEnum.RESIST_ICE],
            [ApplyTypeEnum.RESIST_EARTH, PointsEnum.RESIST_EARTH],
            [ApplyTypeEnum.RESIST_DARK, PointsEnum.RESIST_DARK],
            [ApplyTypeEnum.ANTI_CRITICAL_PCT, PointsEnum.RESIST_CRITICAL],
            [ApplyTypeEnum.ANTI_PENETRATE_PCT, PointsEnum.RESIST_PENETRATE],
            [ApplyTypeEnum.POISON_REDUCE, PointsEnum.POISON_REDUCE],
            [ApplyTypeEnum.KILL_SP_RECOVER, PointsEnum.KILL_SP_RECOVER],
            [ApplyTypeEnum.EXP_DOUBLE_BONUS, PointsEnum.EXP_DOUBLE_BONUS],
            [ApplyTypeEnum.GOLD_DOUBLE_BONUS, PointsEnum.GOLD_DOUBLE_BONUS],
            [ApplyTypeEnum.ITEM_DROP_BONUS, PointsEnum.ITEM_DROP_BONUS],
            [ApplyTypeEnum.POTION_BONUS, PointsEnum.POTION_BONUS],
            [ApplyTypeEnum.KILL_HP_RECOVER, PointsEnum.KILL_HP_RECOVERY],
            [ApplyTypeEnum.IMMUNE_STUN, PointsEnum.IMMUNE_STUN],
            [ApplyTypeEnum.IMMUNE_SLOW, PointsEnum.IMMUNE_SLOW],
            [ApplyTypeEnum.IMMUNE_FALL, PointsEnum.IMMUNE_FALL],
            [ApplyTypeEnum.BOW_DISTANCE, PointsEnum.BOW_DISTANCE],
            [ApplyTypeEnum.CURSE_PCT, PointsEnum.CURSE],
            [ApplyTypeEnum.MAX_STAMINA, PointsEnum.MAX_STAMINA],
            [ApplyTypeEnum.MALL_DEFBONUS, PointsEnum.MALL_DEFBONUS],
            [ApplyTypeEnum.MALL_EXPBONUS, PointsEnum.MALL_EXPBONUS],
            [ApplyTypeEnum.MALL_ITEMBONUS, PointsEnum.MALL_ITEM_BONUS],
            [ApplyTypeEnum.MALL_GOLDBONUS, PointsEnum.MALL_GOLDBONUS],
            [ApplyTypeEnum.SKILL_DAMAGE_BONUS, PointsEnum.SKILL_DAMAGE_BONUS],
            [ApplyTypeEnum.NORMAL_HIT_DAMAGE_BONUS, PointsEnum.NORMAL_HIT_DAMAGE_BONUS],
            [ApplyTypeEnum.SKILL_DEFEND_BONUS, PointsEnum.SKILL_DEFEND_BONUS],
            [ApplyTypeEnum.NORMAL_HIT_DEFEND_BONUS, PointsEnum.NORMAL_HIT_DEFEND_BONUS],
            [ApplyTypeEnum.PC_BANG_EXP_BONUS, PointsEnum.PC_BANG_EXP_BONUS],
            [ApplyTypeEnum.PC_BANG_DROP_BONUS, PointsEnum.PC_BANG_DROP_BONUS],
            [ApplyTypeEnum.RESIST_WARRIOR, PointsEnum.RESIST_WARRIOR],
            [ApplyTypeEnum.RESIST_ASSASSIN, PointsEnum.RESIST_ASSASSIN],
            [ApplyTypeEnum.RESIST_SURA, PointsEnum.RESIST_SURA],
            [ApplyTypeEnum.RESIST_SHAMAN, PointsEnum.RESIST_SHAMAN],
            [ApplyTypeEnum.ENERGY, PointsEnum.ENERGY],
            [ApplyTypeEnum.COSTUME_ATTR_BONUS, PointsEnum.COSTUME_ATTR_BONUS],
            [ApplyTypeEnum.MAGIC_ATTBONUS_PER, PointsEnum.MAGIC_ATT_BONUS_PER],
            [ApplyTypeEnum.MELEE_MAGIC_ATTBONUS_PER, PointsEnum.MELEE_MAGIC_ATT_BONUS_PER],
        ];

        directMappings.forEach(([applyType, pointsEnum]) => {
            it(`${ApplyTypeEnum[applyType]} adds to ${PointsEnum[pointsEnum]}`, () => {
                const item = { getApplies: () => [{ type: applyType, value: 42 }] } as unknown as Item;

                playerApplies.addItemApplies(item);

                expect(playerMock.addPoint.calledOnceWith(pointsEnum, 42)).to.be.true;
            });
        });

        // constants.cpp:598: despite the name, APPLY_MALL_ATTBONUS's bPointType is POINT_ATT_BONUS,
        // not a dedicated mall point - verified directly against the table, not guessed by name.
        it('MALL_ATTBONUS redirects to ATTACK_BONUS, not a dedicated mall point (constants.cpp:598)', () => {
            const item = { getApplies: () => [{ type: ApplyTypeEnum.MALL_ATTBONUS, value: 10 }] } as unknown as Item;

            playerApplies.addItemApplies(item);

            expect(playerMock.addPoint.calledOnceWith(PointsEnum.ATTACK_BONUS, 10)).to.be.true;
        });

        // constants.cpp:626: the literal table points DEF_GRADE at the raw, fully-recomputed
        // POINT_DEF_GRADE - we deliberately redirect to DEF_GRADE_BONUS instead so it isn't silently
        // wiped by the next calcDefense(), the same class of bug this whole effort exists to fix.
        it('DEF_GRADE redirects to DEF_GRADE_BONUS (deliberate divergence from constants.cpp:626)', () => {
            const item = { getApplies: () => [{ type: ApplyTypeEnum.DEF_GRADE, value: 15 }] } as unknown as Item;

            playerApplies.addItemApplies(item);

            expect(playerMock.addPoint.calledOnceWith(PointsEnum.DEF_GRADE_BONUS, 15)).to.be.true;
        });

        // APPLY_SKILL and APPLY_EXTRACT_HP_PCT both resolve to POINT_NONE in the original
        // (constants.cpp:585,619) - neither was ever a simple point add, so both stay unmapped and
        // fall through to the "not implemented yet" log rather than being wired to something wrong.
        it('APPLY_SKILL and EXTRACT_HP_PCT stay unmapped, logging instead of guessing a point', () => {
            const item = {
                getApplies: () => [
                    { type: ApplyTypeEnum.SKILL, value: 1 },
                    { type: ApplyTypeEnum.EXTRACT_HP_PCT, value: 1 },
                ],
            } as unknown as Item;

            playerApplies.addItemApplies(item);

            expect(playerMock.addPoint.called).to.be.false;
            expect(loggerMock.debug.callCount).to.equal(2);
        });
    });
});
