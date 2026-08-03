import { expect } from 'chai';
import Monster from '@/core/domain/entities/game/mob/Monster';
import SpawnConfig from '@/core/domain/entities/game/mob/spawn/SpawnConfig';
import { MobRankEnum } from '@/core/enum/MobRankEnum';
import { BattleTypeEnum } from '@/core/enum/BattleTypeEnum';
import { SpawnConfigTypeEnum } from '@/core/enum/SpawnConfigTypeEnum';

const makeProto = (overrides: Record<string, unknown> = {}) => ({
    vnum: '101',
    name: 'Wild Dog',
    rank: 'PAWN',
    type: 'MONSTER',
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
    damage_min: '1',
    damage_max: '2',
    max_hp: '10',
    regen_cycle: '0',
    regen_percent: '0',
    gold_min: '0',
    gold_max: '0',
    exp: '0',
    def: '0',
    attack_speed: '100',
    move_speed: '100',
    aggressive_hp_pct: '0',
    aggressive_sight: '0',
    attack_range: '100',
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

const makeMonster = (protoOverrides: Record<string, unknown> = {}) =>
    new Monster(
        {
            proto: makeProto(protoOverrides) as any,
            positionX: 0,
            positionY: 0,
            virtualId: 1,
            direction: 0,
        } as any,
        {
            animationManager: { getAnimation: () => undefined } as any,
            dropManager: {} as any,
            experienceManager: {} as any,
            logger: { debug: () => {}, info: () => {}, error: () => {} } as any,
            questManager: {} as any,
            eventTimerManager: { addTimer: () => {}, removeAllTimersFromOwner: () => {} } as any,
        },
    );

describe('proto enum mapping (issue #159)', () => {
    describe('mob rank', () => {
        it('should keep PAWN, whose enum value is 0, instead of falling back to KNIGHT', () => {
            expect(makeMonster({ rank: 'PAWN' }).getRank()).to.equal(MobRankEnum.PAWN);
        });

        it('should keep every other rank', () => {
            expect(makeMonster({ rank: 'S_PAWN' }).getRank()).to.equal(MobRankEnum.S_PAWN);
            expect(makeMonster({ rank: 'KNIGHT' }).getRank()).to.equal(MobRankEnum.KNIGHT);
            expect(makeMonster({ rank: 'BOSS' }).getRank()).to.equal(MobRankEnum.BOSS);
            expect(makeMonster({ rank: 'KING' }).getRank()).to.equal(MobRankEnum.KING);
        });

        it('should still fall back to KNIGHT for a rank the enum does not know', () => {
            expect(makeMonster({ rank: 'NOT_A_RANK' }).getRank()).to.equal(MobRankEnum.KNIGHT);
        });
    });

    describe('battle type', () => {
        it('should keep MELEE, whose enum value is 0', () => {
            expect(makeMonster({ battle_type: 'MELEE' }).getBattleType()).to.equal(BattleTypeEnum.MELEE);
        });

        it('should keep RANGE and fall back for an unknown type', () => {
            expect(makeMonster({ battle_type: 'RANGE' }).getBattleType()).to.equal(BattleTypeEnum.RANGE);
            expect(makeMonster({ battle_type: 'NOPE' }).getBattleType()).to.equal(BattleTypeEnum.MELEE);
        });
    });

    describe('spawn config type', () => {
        const makeSpawn = (type: string) =>
            SpawnConfig.create({
                type,
                x: '10',
                y: '10',
                rangeX: '1',
                rangeY: '1',
                direction: '0',
                spawnTime: '5s',
                count: '1',
                vnum: '101',
            } as any);

        it('should keep the group type, whose enum value is 0', () => {
            expect(makeSpawn('g').getType()).to.equal(SpawnConfigTypeEnum.GROUP);
        });

        it('should keep the other known types', () => {
            expect(makeSpawn('m').getType()).to.equal(SpawnConfigTypeEnum.MONSTER);
            expect(makeSpawn('e').getType()).to.equal(SpawnConfigTypeEnum.EXCEPTION);
            expect(makeSpawn('r').getType()).to.equal(SpawnConfigTypeEnum.GROUP_COLLECTION);
            expect(makeSpawn('s').getType()).to.equal(SpawnConfigTypeEnum.SPECIAL);
        });

        it('should still fall back to monster for an unknown token', () => {
            expect(makeSpawn('zz').getType()).to.equal(SpawnConfigTypeEnum.MONSTER);
        });
    });
});
