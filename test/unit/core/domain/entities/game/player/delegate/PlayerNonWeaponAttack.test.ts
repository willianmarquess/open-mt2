import { expect } from 'chai';
import sinon from 'sinon';
import PlayerBattleAgainstMobStrategy from '@/core/domain/entities/game/player/delegate/battle/PlayerBattleAgainstMobStrategy';
import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
import { BattleTypeEnum } from '@/core/enum/BattleTypeEnum';
import { ItemTypeEnum } from '@/core/enum/ItemTypeEnum';
import { ItemSubTypeEnum } from '@/core/enum/ItemSubTypeEnum';
import Player from '@/core/domain/entities/game/player/Player';
import Monster from '@/core/domain/entities/game/mob/Monster';

const FISHING_POLE_VALUES = [10, 5, 10, 100, 27400, 0];
const SWORD_VALUES = [0, 15, 19, 13, 15, 0];

const createWeapon = (type: ItemTypeEnum, subType: number, values: Array<number>) => ({
    getType: () => type,
    getSubType: () => subType,
    getValues: () => values,
});

const createVictim = (taken: Array<number>) => ({
    getPositionX: () => 0,
    getPositionY: () => 0,
    getBattleType: () => BattleTypeEnum.MELEE,
    getAttackRange: () => 100,
    getAttackRating: () => 0,
    getDefense: () => 0,
    getVirtualId: () => 1,
    getPoint: () => 0,
    getResist: () => 0,
    isRaceByFlag: () => false,
    isAffectByFlag: () => false,
    getDrainSp: () => 0,
    isStoneSkinner: () => false,
    takeDamage: (_attacker: unknown, damage: number) => taken.push(damage),
});

const createAttacker = (weapon: unknown) => ({
    getPositionX: () => 0,
    getPositionY: () => 0,
    getWeapon: () => weapon,
    getAttackRating: () => 0,
    getAttack: () => 1000,
    getPoint: () => 0,
    getLevel: () => 1,
    debugChat: () => {},
    sendDamageCaused: () => {},
});

const attack = (weapon: unknown) => {
    const taken: Array<number> = [];
    const logger = { info: sinon.stub(), error: sinon.stub() };
    const strategy = new PlayerBattleAgainstMobStrategy(createAttacker(weapon) as unknown as Player, logger as never);

    strategy.execute(AttackTypeEnum.NORMAL, createVictim(taken) as unknown as Monster);

    return { taken, logger };
};

describe('player melee attack with a non-weapon in the weapon slot', () => {
    it('refuses to attack while holding a fishing rod', () => {
        const rod = createWeapon(ItemTypeEnum.ITEM_ROD, 0, FISHING_POLE_VALUES);

        const { taken, logger } = attack(rod);

        expect(taken, 'a rod must not damage the victim').to.deep.equal([]);
        expect(logger.info.calledWithMatch(/cant handle item type/), 'and the refusal is logged').to.equal(true);
    });

    it('refuses to attack while holding a pickaxe', () => {
        const pick = createWeapon(ItemTypeEnum.ITEM_PICK, 0, [10, 1, 6000, 100, 29101, 0]);

        const { taken } = attack(pick);

        expect(taken, 'a pickaxe must not damage the victim').to.deep.equal([]);
    });

    it('still attacks with a real weapon', () => {
        const sword = createWeapon(ItemTypeEnum.ITEM_WEAPON, ItemSubTypeEnum.WEAPON_SWORD, SWORD_VALUES);

        const { taken } = attack(sword);

        expect(taken.length, 'a sword still lands its hit').to.equal(1);
        expect(taken[0], 'and deals damage').to.be.greaterThan(0);
    });

    it('still attacks bare handed', () => {
        const { taken } = attack(null);

        expect(taken.length, 'an empty weapon slot still lands its hit').to.equal(1);
    });

    it('still refuses a bow, as before', () => {
        const bow = createWeapon(ItemTypeEnum.ITEM_WEAPON, ItemSubTypeEnum.WEAPON_BOW, SWORD_VALUES);

        const { taken, logger } = attack(bow);

        expect(taken, 'a bow is not a melee weapon').to.deep.equal([]);
        expect(logger.info.calledWithMatch(/bow attacks/), 'and keeps its own message').to.equal(true);
    });
});
