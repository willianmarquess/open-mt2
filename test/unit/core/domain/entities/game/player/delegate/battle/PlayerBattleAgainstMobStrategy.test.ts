import { expect } from 'chai';
import sinon from 'sinon';
import PlayerBattleAgainstMobStrategy from '@/core/domain/entities/game/player/delegate/battle/PlayerBattleAgainstMobStrategy';
import Stone from '@/core/domain/entities/game/mob/Stone';
import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';
import MathUtil from '@/core/domain/util/MathUtil';

const makeProto = (overrides: Record<string, unknown> = {}) => ({
    vnum: '8001',
    name: 'Metin of Sorrow',
    rank: 'KING',
    type: 'STONE',
    battle_type: 'MELEE',
    level: '1',
    size: '0',
    ai_flag: '',
    race_flag: '',
    immune_flag: '',
    empire: '0',
    folder: '',
    on_click: '0',
    st: '0',
    dx: '0',
    ht: '0',
    iq: '0',
    damage_min: '0',
    damage_max: '0',
    max_hp: '1000',
    regen_cycle: '0',
    regen_percent: '0',
    gold_min: '0',
    gold_max: '0',
    exp: '0',
    def: '10',
    attack_speed: '100',
    move_speed: '100',
    aggressive_hp_pct: '0',
    aggressive_sight: '0',
    attack_range: '0',
    drop_item: '0',
    resurrection_vnum: '0',
    enchant_curse: '0',
    enchant_slow: '0',
    enchant_poison: '0',
    enchant_stun: '0',
    enchant_critical: '0',
    enchant_penetrate: '0',
    resist_sword: '0',
    resist_twohand: '0',
    resist_dagger: '0',
    resist_bell: '0',
    resist_fan: '0',
    resist_bow: '0',
    resist_fire: '0',
    resist_elect: '0',
    resist_magic: '0',
    resist_wind: '0',
    resist_poison: '0',
    dam_multiply: '1',
    summon: '0',
    drain_sp: '0',
    mob_color: '0',
    polymorph_item: '0',
    skill_level0: '0',
    skill_vnum0: '0',
    skill_level1: '0',
    skill_vnum1: '0',
    skill_level2: '0',
    skill_vnum2: '0',
    skill_level3: '0',
    skill_vnum3: '0',
    skill_level4: '0',
    skill_vnum4: '0',
    sp_berserk: '0',
    sp_stoneskin: '0',
    sp_godspeed: '0',
    sp_deathblow: '0',
    sp_revive: '0',
    ...overrides,
});

const makeStone = () => {
    const stone = new Stone(
        {
            proto: makeProto() as any,
            positionX: 0,
            positionY: 0,
            virtualId: 1,
            direction: 0,
        } as any,
        {
            animationManager: { getAnimation: () => undefined } as any,
            questManager: {} as any,
            eventTimerManager: {
                addTimer: () => {},
                removeAllTimersFromOwner: () => {},
                isTimerActive: () => false,
            } as any,
            groups: [],
        },
    );
    stone.onSpawn();
    return stone;
};

/** `points` returns 0 for every PointsEnum by default, so every chance-based proc (crit, penetrate,
 * poison, stun, slow, steal, ...) is deterministically off unless a test overrides a specific one. */
const makePlayer = (points: Partial<Record<PointsEnum, number>> = {}) =>
    ({
        getPositionX: () => 0,
        getPositionY: () => 0,
        getWeapon: () => undefined,
        getAttack: () => 100,
        getAttackRating: () => 0,
        getLevel: () => 1,
        getPoint: (point: PointsEnum) => points[point] ?? 0,
        addPoint: sinon.stub(),
        isDead: () => false,
        debugChat: sinon.stub(),
        sendDamageCaused: sinon.stub(),
        getVirtualId: () => 99,
    }) as any;

describe('PlayerBattleAgainstMobStrategy against a metin stone', () => {
    afterEach(() => {
        sinon.restore();
    });

    it('deals damage to a stone through the same execute() entry point as a monster', () => {
        const stone = makeStone();
        const player = makePlayer();
        const strategy = new PlayerBattleAgainstMobStrategy(player, { info: sinon.stub() } as any);

        const healthBefore = stone.getPoint(PointsEnum.HEALTH);
        strategy.execute(AttackTypeEnum.NORMAL, stone);

        expect(stone.getPoint(PointsEnum.HEALTH)).to.be.lessThan(healthBefore);
    });

    it('still applies critical damage against a stone (roughly doubles the plain hit)', () => {
        const plainHit = makeStone();
        new PlayerBattleAgainstMobStrategy(makePlayer(), { info: sinon.stub() } as any).execute(
            AttackTypeEnum.NORMAL,
            plainHit,
        );
        const plainDamage = 1000 - plainHit.getPoint(PointsEnum.HEALTH);

        const critStone = makeStone();
        new PlayerBattleAgainstMobStrategy(makePlayer({ [PointsEnum.CRITICAL_CHANCE]: 100 }), {
            info: sinon.stub(),
        } as any).execute(AttackTypeEnum.NORMAL, critStone);
        const critDamage = 1000 - critStone.getPoint(PointsEnum.HEALTH);

        expect(critDamage).to.equal(plainDamage * 2);
    });

    it('still applies penetrate damage against a stone (adds its defense back on top)', () => {
        const plainHit = makeStone();
        new PlayerBattleAgainstMobStrategy(makePlayer(), { info: sinon.stub() } as any).execute(
            AttackTypeEnum.NORMAL,
            plainHit,
        );
        const plainDamage = 1000 - plainHit.getPoint(PointsEnum.HEALTH);

        const penetrateStone = makeStone();
        new PlayerBattleAgainstMobStrategy(makePlayer({ [PointsEnum.PENETRATE_CHANCE]: 100 }), {
            info: sinon.stub(),
        } as any).execute(AttackTypeEnum.NORMAL, penetrateStone);
        const penetrateDamage = 1000 - penetrateStone.getPoint(PointsEnum.HEALTH);

        expect(penetrateDamage).to.be.greaterThan(plainDamage);
    });

    it('does not poison a stone even with a guaranteed poison chance', () => {
        const stone = makeStone();
        const player = makePlayer({ [PointsEnum.POISON_CHANCE]: 100 });
        const strategy = new PlayerBattleAgainstMobStrategy(player, { info: sinon.stub() } as any);

        strategy.execute(AttackTypeEnum.NORMAL, stone);

        expect(stone.isAffectByFlag(AffectBitsTypeEnum.POISON)).to.be.false;
    });

    it('does not stun a stone even with a guaranteed stun chance', () => {
        const stone = makeStone();
        const player = makePlayer({ [PointsEnum.STUN_CHANCE]: 100 });
        const strategy = new PlayerBattleAgainstMobStrategy(player, { info: sinon.stub() } as any);

        expect(() => strategy.execute(AttackTypeEnum.NORMAL, stone)).to.not.throw();
        expect(stone.isAffectByFlag(AffectBitsTypeEnum.STUN)).to.be.false;
    });

    it('does drain the stone into the attacker on a guaranteed steal-health roll (char_battle.cpp:1866-1882 has no IsStone()/IsPC() check)', () => {
        // The steal chance is a hardcoded 1-in-10 roll (`pct = 1`), independent of the point value -
        // pin MathUtil.getRandomInt(1, 100)|(1, 10) to 1 so it always passes.
        sinon.stub(MathUtil, 'getRandomInt').returns(1);

        const stone = makeStone();
        const player = makePlayer({ [PointsEnum.STEAL_HEALTH]: 100 });
        const strategy = new PlayerBattleAgainstMobStrategy(player, { info: sinon.stub() } as any);

        strategy.execute(AttackTypeEnum.NORMAL, stone);

        expect((player.addPoint as sinon.SinonStub).calledWith(PointsEnum.HEALTH)).to.be.true;
    });

    it('grants mana from a stone hit without ever damaging the stone for it (char_battle.cpp:1893-1906: the SP debit only ever runs `if (IsPC())`)', () => {
        sinon.stub(MathUtil, 'getRandomInt').returns(1);

        const stone = makeStone();
        const player = makePlayer({ [PointsEnum.STEAL_MANA]: 100 });
        const strategy = new PlayerBattleAgainstMobStrategy(player, { info: sinon.stub() } as any);

        const healthBeforeManaSteal = stone.getPoint(PointsEnum.HEALTH);
        strategy.execute(AttackTypeEnum.NORMAL, stone);
        const damageFromMainHit = healthBeforeManaSteal - stone.getPoint(PointsEnum.HEALTH);

        expect((player.addPoint as sinon.SinonStub).calledWith(PointsEnum.MANA)).to.be.true;
        // the only HP the stone should lose is from the primary hit itself, not an extra steal tick
        expect(damageFromMainHit).to.be.greaterThan(0).and.lessThan(200);
    });
});
