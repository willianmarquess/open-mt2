import { expect } from 'chai';
import sinon from 'sinon';
import MonsterBattle from '@/core/domain/entities/game/mob/delegate/battle/MonsterBattle';
import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
import { BattleTypeEnum } from '@/core/enum/BattleTypeEnum';
import { DamageFlagEnum } from '@/core/enum/DamageFlagEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';
import { MobEnchantEnum } from '@/core/enum/MobEnchantEnum';
import MathUtil from '@/core/domain/util/MathUtil';

const REFLECT_PERCENTAGE = 50;

const createVictim = (points: Partial<Record<PointsEnum, number>>) => {
    const received: Array<{ damage: number; damageFlags: number }> = [];
    const taken: Array<number> = [];

    return {
        received,
        taken,
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
        sendDamageReceived: (packet: { damage: number; damageFlags: number }) => received.push(packet),
        takeDamage: (_attacker: unknown, damage: number) => taken.push(damage),
    };
};

const createAttacker = (battleType: BattleTypeEnum, reflected: Array<number>, projectiles: Array<unknown> = []) => ({
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
    createFlyTargeting: ({ target }: { target: unknown }) => projectiles.push(target),
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

    describe('magic attacks (issue #51)', () => {
        const magicAttack = (points: Partial<Record<PointsEnum, number>> = {}) => {
            const projectiles: Array<unknown> = [];
            const attacker = createAttacker(BattleTypeEnum.MAGIC, [], projectiles);
            const victim = createVictim(points);

            new MonsterBattle(attacker as any, createLogger() as any).execute(AttackTypeEnum.NORMAL, victim as any);

            return { victim, projectiles };
        };

        it('should land damage instead of hitting the TODO branch', () => {
            const { victim } = magicAttack();

            expect(victim.taken, 'the victim took damage').to.have.lengthOf(1);
            expect(victim.taken[0]).to.be.greaterThan(0);
        });

        it('should draw a projectile, like the original FlyTarget for BATTLE_TYPE_MAGIC', () => {
            const { victim, projectiles } = magicAttack();

            expect(projectiles).to.deep.equal([victim]);
        });

        it('should reduce the damage by the resist magic point, not resist bow', () => {
            const { victim: unresisted } = magicAttack();
            const { victim: resisted } = magicAttack({ [PointsEnum.RESIST_MAGIC]: 50 });
            const { victim: wrongResist } = magicAttack({ [PointsEnum.RESIST_BOW]: 50 });

            expect(resisted.taken[0], 'resist magic halves it').to.equal(Math.round(unresisted.taken[0] / 2));
            expect(wrongResist.taken[0], 'resist bow is for arrows').to.equal(unresisted.taken[0]);
        });

        it('should not be blockable or dodgeable, matching the original', () => {
            const { victim } = magicAttack({ [PointsEnum.BLOCK]: 100, [PointsEnum.DODGE]: 100 });

            expect(victim.taken, 'block and dodge only gate physical hits').to.have.lengthOf(1);
            expect(victim.received[0].damageFlags & DamageFlagEnum.BLOCK).to.equal(0);
            expect(victim.received[0].damageFlags & DamageFlagEnum.DODGE).to.equal(0);
        });

        it('should carry the NORMAL damage flag, so the client renders the hit', () => {
            const { victim } = magicAttack();

            expect(victim.received[0].damageFlags & DamageFlagEnum.NORMAL).to.not.equal(0);
        });

        it('should be absorbed by a mana shield, the way every skill-type hit is in the original', () => {
            const shielded = (() => {
                const projectiles: Array<unknown> = [];
                const attacker = createAttacker(BattleTypeEnum.MAGIC, [], projectiles);
                const victim = {
                    ...createVictim({ [PointsEnum.MANASHIELD]: 100, [PointsEnum.MANA]: 10_000 }),
                    isAffectByFlag: () => true,
                    isSura: () => true,
                };

                new MonsterBattle(attacker as any, createLogger() as any).execute(AttackTypeEnum.NORMAL, victim as any);

                return victim;
            })();
            const { victim: unshielded } = magicAttack();

            expect(shielded.taken[0], 'a third of the hit went to mana').to.be.lessThan(unshielded.taken[0]);
        });

        it('should not reflect back at the caster, who is never in melee reach', () => {
            expect(attack(BattleTypeEnum.MAGIC)).to.have.lengthOf(0);
        });
    });

    describe('resist normal damage (Blessing, char_battle.cpp:1789-1790)', () => {
        it('reduces damage by RESIST_NORMAL_DAMAGE while under the Blessing affect', () => {
            const projectiles: Array<unknown> = [];
            const attacker = createAttacker(BattleTypeEnum.MAGIC, [], projectiles);
            const blessed = {
                ...createVictim({ [PointsEnum.RESIST_NORMAL_DAMAGE]: 50 }),
                isAffectByFlag: (flag: AffectBitsTypeEnum) => flag === AffectBitsTypeEnum.BLESSING,
            };
            const unblessed = createVictim({ [PointsEnum.RESIST_NORMAL_DAMAGE]: 50 });

            new MonsterBattle(attacker as any, createLogger() as any).execute(AttackTypeEnum.NORMAL, blessed as any);
            new MonsterBattle(attacker as any, createLogger() as any).execute(AttackTypeEnum.NORMAL, unblessed as any);

            expect(blessed.taken[0], 'blessed halves it').to.equal(Math.round(unblessed.taken[0] / 2));
        });

        it('does not reduce damage without the Blessing affect, even with RESIST_NORMAL_DAMAGE set', () => {
            const projectiles: Array<unknown> = [];
            const attacker = createAttacker(BattleTypeEnum.MAGIC, [], projectiles);
            const withPointNoAffect = createVictim({ [PointsEnum.RESIST_NORMAL_DAMAGE]: 50 });
            const withNeither = createVictim({});

            new MonsterBattle(attacker as any, createLogger() as any).execute(
                AttackTypeEnum.NORMAL,
                withPointNoAffect as any,
            );
            new MonsterBattle(attacker as any, createLogger() as any).execute(
                AttackTypeEnum.NORMAL,
                withNeither as any,
            );

            expect(withPointNoAffect.taken[0]).to.equal(withNeither.taken[0]);
        });
    });

    describe('RESIST_CRITICAL / RESIST_PENETRATE (char_battle.cpp:1822,1854)', () => {
        afterEach(() => sinon.restore());

        const createEnchantAttacker = (enchant: MobEnchantEnum, chance: number) => ({
            ...createAttacker(BattleTypeEnum.MAGIC, []),
            getEnchant: (type: MobEnchantEnum) => (type === enchant ? chance : 0),
        });

        it('subtracts RESIST_CRITICAL from the attacker crit chance before the roll', () => {
            sinon.stub(MathUtil, 'getRandomInt').returns(50);
            const attacker = createEnchantAttacker(MobEnchantEnum.CRITICAL, 100);

            const resisted = createVictim({ [PointsEnum.RESIST_CRITICAL]: 60 }); // 100 - 60 = 40, roll(50) misses
            const unresisted = createVictim({ [PointsEnum.RESIST_CRITICAL]: 0 }); // 100 - 0 = 100, roll(50) hits

            new MonsterBattle(attacker as any, createLogger() as any).execute(AttackTypeEnum.NORMAL, resisted as any);
            new MonsterBattle(attacker as any, createLogger() as any).execute(AttackTypeEnum.NORMAL, unresisted as any);

            expect(unresisted.taken[0], 'unresisted still crits').to.equal(resisted.taken[0] * 2);
        });

        it('subtracts RESIST_PENETRATE from the attacker penetrate chance before the roll', () => {
            sinon.stub(MathUtil, 'getRandomInt').returns(50);
            const attacker = createEnchantAttacker(MobEnchantEnum.PENETRATE, 100);

            const resisted = { ...createVictim({ [PointsEnum.RESIST_PENETRATE]: 60 }), getDefense: () => 50 };
            const unresisted = { ...createVictim({ [PointsEnum.RESIST_PENETRATE]: 0 }), getDefense: () => 50 };

            new MonsterBattle(attacker as any, createLogger() as any).execute(AttackTypeEnum.NORMAL, resisted as any);
            new MonsterBattle(attacker as any, createLogger() as any).execute(AttackTypeEnum.NORMAL, unresisted as any);

            expect(unresisted.taken[0], 'unresisted still gets the penetrate bonus').to.be.greaterThan(
                resisted.taken[0],
            );
        });
    });

    describe('IMMUNE_SLOW (mirrors IMMUNE_STUN, char.h:89)', () => {
        afterEach(() => sinon.restore());

        const createSlowOnlyAttacker = () => ({
            ...createAttacker(BattleTypeEnum.MAGIC, []),
            getEnchant: (type: MobEnchantEnum) => (type === MobEnchantEnum.SLOW ? 100 : 0),
        });

        it('has an 80% chance to suppress the slow when IMMUNE_SLOW is set', () => {
            const attacker = createSlowOnlyAttacker();
            const addPoint = sinon.stub();

            // 50 satisfies both rolls: the slow-attempt roll (chance=100, any 1-100 passes) and the
            // immunity suppression roll (50 <= 80, suppressed).
            sinon.stub(MathUtil, 'getRandomInt').returns(50);

            const victim = { ...createVictim({ [PointsEnum.IMMUNE_SLOW]: 1 }), addPoint };

            new MonsterBattle(attacker as any, createLogger() as any).execute(AttackTypeEnum.NORMAL, victim as any);

            expect(addPoint.called, 'MOVE_SPEED should never have been touched').to.be.false;
        });

        it('does not suppress the slow when IMMUNE_SLOW is not set', () => {
            const attacker = createSlowOnlyAttacker();
            const addPoint = sinon.stub();

            sinon.stub(MathUtil, 'getRandomInt').returns(1);

            const victim = { ...createVictim({}), addPoint };

            new MonsterBattle(attacker as any, createLogger() as any).execute(AttackTypeEnum.NORMAL, victim as any);

            expect(addPoint.calledWith(PointsEnum.MOVE_SPEED, -30)).to.be.true;
        });
    });
});
