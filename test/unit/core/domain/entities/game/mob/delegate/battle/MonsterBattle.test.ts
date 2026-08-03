import { expect } from 'chai';
import MonsterBattle from '@/core/domain/entities/game/mob/delegate/battle/MonsterBattle';
import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
import { BattleTypeEnum } from '@/core/enum/BattleTypeEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';

const REFLECT_PERCENTAGE = 50;

const createVictim = (points: Partial<Record<PointsEnum, number>>) => ({
    getPoint: (point: PointsEnum) => points[point] ?? 0,
    getAttackRating: () => 0,
    getDefense: () => 0,
    getPositionX: () => 0,
    getPositionY: () => 0,
    isAffectByFlag: () => false,
    setAffectFlag: () => {},
    removeAffectFlag: () => {},
    updateView: () => {},
    addEventTimer: () => {},
    addPoint: () => {},
    debugChat: () => {},
    sendDamageReceived: () => {},
    takeDamage: () => {},
});

const createAttacker = (battleType: BattleTypeEnum, reflected: Array<number>) => ({
    getBattleType: () => battleType,
    getAttackRange: () => 1000,
    getAttack: () => 500,
    getAttackRating: () => 0,
    getEnchant: () => 0,
    getLevel: () => 1,
    getDamageMin: () => 1,
    getDamageMax: () => 1,
    getDamMultiply: () => 1,
    getPositionX: () => 0,
    getPositionY: () => 0,
    isDeathBlower: () => false,
    isImmuneByFlag: () => false,
    createFlyTargeting: () => {},
    takeDamage: (_victim: unknown, damage: number) => reflected.push(damage),
});

const createLogger = () => ({ info: () => {}, debug: () => {}, error: () => {} });

const attack = (battleType: BattleTypeEnum) => {
    const reflected: Array<number> = [];
    const attacker = createAttacker(battleType, reflected);
    const victim = createVictim({ [PointsEnum.REFLECT_MELEE]: REFLECT_PERCENTAGE });

    new MonsterBattle(attacker as any, createLogger() as any).execute(AttackTypeEnum.NORMAL, victim as any);

    return reflected;
};

describe('MonsterBattle', () => {
    describe('reflect melee', () => {
        it('should reflect damage back at a melee monster when the victim has reflect melee', () => {
            expect(attack(BattleTypeEnum.MELEE)).to.have.lengthOf(1);
        });

        it('should not reflect damage back at a ranged monster, which never gets close enough to be hit back', () => {
            expect(attack(BattleTypeEnum.RANGE)).to.have.lengthOf(0);
        });
    });
});
