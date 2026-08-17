import { expect } from 'chai';
import sinon from 'sinon';
import Stone from '@/core/domain/entities/game/mob/Stone';
import Player from '@/core/domain/entities/game/player/Player';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';
import { TimedEventsEnum } from '@/core/enum/TimedEventsEnum';
import MathUtil from '@/core/domain/util/MathUtil';

const IDLE_TICK_ID = 'STONE_IDLE_TICK';

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
    // The original repurposes these two columns as the [min, max] group-vnum range this stone
    // rolls from at every idle tick (char_state.cpp:393) - kept distinct (104 vs 109) so tests can
    // tell "picked the min" apart from "picked the max".
    attack_speed: '104',
    move_speed: '109',
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

/** A fake event timer manager that lets tests fire a timer's callback on demand instead of waiting
 * on a real clock, and answers isTimerActive/removeTimer from the same registry. */
const createFakeEventTimerManager = () => {
    const callbacks = new Map<string, () => void>();
    return {
        addTimer: ({ id, eventFunction }: { id: string; eventFunction: () => void }) => {
            callbacks.set(id, eventFunction);
        },
        removeTimer: (_ownerId: number, id: string) => {
            callbacks.delete(id);
        },
        removeAllTimersFromOwner: () => {
            callbacks.clear();
        },
        isTimerActive: (_ownerId: number, id: string) => callbacks.has(id),
        fire: (id: string) => callbacks.get(id)?.(),
    };
};

const makeAttacker = () =>
    ({
        isDead: () => false,
        getVirtualId: () => 42,
    }) as any;

const makeStone = (protoOverrides: Record<string, unknown> = {}, groups: Array<any> = []) => {
    const eventTimerManager = createFakeEventTimerManager();
    const area = { spawnMob: sinon.stub(), despawn: sinon.stub(), onMonsterMove: sinon.stub() };

    const stone = new Stone(
        {
            proto: makeProto(protoOverrides) as any,
            positionX: 0,
            positionY: 0,
            virtualId: 1,
            direction: 0,
        } as any,
        {
            animationManager: { getAnimation: () => undefined } as any,
            questManager: {} as any,
            eventTimerManager: eventTimerManager as any,
            groups,
        },
    );
    (stone as any).area = area;

    return { stone, eventTimerManager, area };
};

describe('Stone', () => {
    afterEach(() => {
        sinon.restore();
    });

    it('starts at 0 HP until onSpawn calculates its points from the proto (Mob.onSpawn parity)', () => {
        const { stone } = makeStone();
        expect(stone.getPoint(PointsEnum.HEALTH)).to.equal(0);

        stone.onSpawn();

        expect(stone.getPoint(PointsEnum.HEALTH)).to.equal(1000);
        expect(stone.getPoint(PointsEnum.MAX_HEALTH)).to.equal(1000);
    });

    it('starts the once-a-second idle checkpoint tick on spawn (char_state.cpp:361-367, 390)', () => {
        const { stone, eventTimerManager } = makeStone();
        const addTimer = sinon.spy(eventTimerManager, 'addTimer');

        stone.onSpawn();

        const idleTickCall = addTimer.getCalls().find((call) => call.args[0].id === IDLE_TICK_ID);
        expect(idleTickCall, 'expected an addTimer call for the idle tick').to.not.be.undefined;
        expect(idleTickCall!.args[0].options).to.deep.include({ interval: 1_000 });
    });

    it('loses HP when it takes damage, and reports the right health percentage', () => {
        const { stone } = makeStone();
        stone.onSpawn();

        stone.takeDamage(makeAttacker(), 250);

        expect(stone.getPoint(PointsEnum.HEALTH)).to.equal(750);
        expect(stone.getHealthPercentage()).to.equal(75);
    });

    it('dies once its HP reaches 0', () => {
        const { stone } = makeStone();
        stone.onSpawn();

        expect(stone.isDead()).to.be.false;

        stone.takeDamage(makeAttacker(), 1000);

        expect(stone.isDead()).to.be.true;
    });

    it('does nothing once already dead', () => {
        const { stone } = makeStone();
        stone.onSpawn();
        stone.takeDamage(makeAttacker(), 1000);

        const healthBeforeSecondHit = stone.getPoint(PointsEnum.HEALTH);
        stone.takeDamage(makeAttacker(), 10);

        expect(stone.getPoint(PointsEnum.HEALTH)).to.equal(healthBeforeSecondHit);
    });

    describe('health regen (recovery_event, char.cpp:2308-2379: no IsStone() exclusion, same as Monster)', () => {
        it('starts a regen timer on spawn, at the proto regen_cycle', () => {
            const { stone, eventTimerManager } = makeStone({ regen_cycle: '5', regen_percent: '10' });
            const addTimer = sinon.spy(eventTimerManager, 'addTimer');

            stone.onSpawn();

            const regenCall = addTimer.getCalls().find((call) => call.args[0].id === TimedEventsEnum.REGEN_HEALTH);
            expect(regenCall, 'expected an addTimer call for health regen').to.not.be.undefined;
            expect(regenCall!.args[0].options).to.deep.include({ interval: 5_000 });
        });

        it('heals a percentage of max HP on each regen tick', () => {
            const { stone, eventTimerManager } = makeStone({ regen_cycle: '5', regen_percent: '10' });
            stone.onSpawn();
            stone.takeDamage(makeAttacker(), 500); // 1000 -> 500

            eventTimerManager.fire(TimedEventsEnum.REGEN_HEALTH);

            expect(stone.getPoint(PointsEnum.HEALTH)).to.equal(600); // +10% of max (1000)
        });

        it('never regens past max HP', () => {
            const { stone, eventTimerManager } = makeStone({ regen_cycle: '5', regen_percent: '50' });
            stone.onSpawn();
            stone.takeDamage(makeAttacker(), 10); // 1000 -> 990

            eventTimerManager.fire(TimedEventsEnum.REGEN_HEALTH);

            expect(stone.getPoint(PointsEnum.HEALTH)).to.equal(1000);
        });

        it('does not regen while poisoned', () => {
            const { stone, eventTimerManager } = makeStone({ regen_cycle: '5', regen_percent: '10' });
            stone.onSpawn();
            stone.takeDamage(makeAttacker(), 500);
            stone.setAffectFlag(AffectBitsTypeEnum.POISON);

            eventTimerManager.fire(TimedEventsEnum.REGEN_HEALTH);

            expect(stone.getPoint(PointsEnum.HEALTH)).to.equal(500);
        });

        it('does not regen once dead', () => {
            const { stone, eventTimerManager } = makeStone({ regen_cycle: '5', regen_percent: '10' });
            stone.onSpawn();
            stone.takeDamage(makeAttacker(), 1000); // dies

            eventTimerManager.fire(TimedEventsEnum.REGEN_HEALTH);

            expect(stone.getPoint(PointsEnum.HEALTH)).to.equal(0);
        });
    });

    describe('idle checkpoint ladder (char_state.cpp:388-498)', () => {
        it('spawns nothing on a tick while still at full health', () => {
            const { stone, eventTimerManager, area } = makeStone();
            stone.onSpawn();

            eventTimerManager.fire(IDLE_TICK_ID);

            expect(area.spawnMob.called).to.be.false;
        });

        it('spawns nothing on a tick once already dead', () => {
            const { stone, eventTimerManager, area } = makeStone();
            stone.onSpawn();
            stone.takeDamage(makeAttacker(), 1000);
            area.spawnMob.resetHistory();

            eventTimerManager.fire(IDLE_TICK_ID);

            expect(area.spawnMob.called).to.be.false;
        });

        it('fires the weakest checkpoint (<=99%) the first time HP drops at all, picking a group vnum from its own [attack_speed, move_speed] range', () => {
            sinon.stub(MathUtil, 'getRandomInt').callsFake((min) => min);

            const group = { vnum: '104', leaderVnum: '104', mobs: [{ vnum: '101' }] };
            const { stone, eventTimerManager, area } = makeStone({}, [group]);
            stone.onSpawn();
            stone.takeDamage(makeAttacker(), 10); // 1000 -> 990 (99%)

            eventTimerManager.fire(IDLE_TICK_ID);

            // the <=99% checkpoint spawns exactly one group of one member
            expect(area.spawnMob.calledOnceWith(101)).to.be.true;
        });

        it('does not refire the same checkpoint on a later tick when HP has not dropped further', () => {
            sinon.stub(MathUtil, 'getRandomInt').callsFake((min) => min);

            const group = { vnum: '104', leaderVnum: '104', mobs: [{ vnum: '101' }] };
            const { stone, eventTimerManager, area } = makeStone({}, [group]);
            stone.onSpawn();
            stone.takeDamage(makeAttacker(), 10); // 99%

            eventTimerManager.fire(IDLE_TICK_ID);
            eventTimerManager.fire(IDLE_TICK_ID);

            expect(area.spawnMob.callCount).to.equal(1);
        });

        it('fires a lower checkpoint with more reinforcement groups once HP drops further', () => {
            sinon.stub(MathUtil, 'getRandomInt').callsFake((min) => min);

            const group = { vnum: '104', leaderVnum: '104', mobs: [{ vnum: '101' }] };
            const { stone, eventTimerManager, area } = makeStone({}, [group]);
            stone.onSpawn();

            stone.takeDamage(makeAttacker(), 10); // 99% -> checkpoint <=99 (1 group)
            eventTimerManager.fire(IDLE_TICK_ID);

            stone.takeDamage(makeAttacker(), 490); // 990 -> 500 = 50% -> checkpoint <=50 (2 groups)
            eventTimerManager.fire(IDLE_TICK_ID);

            // 1 (from <=99%) + 2 (from <=50%) = 3 spawnMob calls total
            expect(area.spawnMob.callCount).to.equal(3);
        });

        it('does nothing when no group is configured for the rolled vnum', () => {
            sinon.stub(MathUtil, 'getRandomInt').callsFake((min) => min);

            const { stone, eventTimerManager, area } = makeStone({}, []);
            stone.onSpawn();
            stone.takeDamage(makeAttacker(), 10);

            eventTimerManager.fire(IDLE_TICK_ID);

            expect(area.spawnMob.called).to.be.false;
        });

        it('broadcasts the attack motion straight to already-nearby players, never through Area.onMonsterMove (char.cpp:2738-2751: SendMovePacket is a plain viewer broadcast with no AOI side effects)', () => {
            sinon.stub(MathUtil, 'getRandomInt').callsFake((min) => min);

            const { stone, eventTimerManager, area } = makeStone({}, []);
            stone.onSpawn();

            const player = Object.assign(Object.create(Player.prototype), { updateOtherEntity: sinon.stub() });
            stone.getNearbyEntities().set(99, player);

            stone.takeDamage(makeAttacker(), 10); // 99%
            eventTimerManager.fire(IDLE_TICK_ID);

            expect((area.onMonsterMove as sinon.SinonStub).called).to.be.false;
            expect(player.updateOtherEntity.calledOnce).to.be.true;
            expect(player.updateOtherEntity.firstCall.args[0]).to.include({
                virtualId: stone.getVirtualId(),
                positionX: stone.getPositionX(),
                positionY: stone.getPositionY(),
            });
        });
    });
});
