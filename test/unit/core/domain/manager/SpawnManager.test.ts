import { expect } from 'chai';
import sinon from 'sinon';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import SpawnManager from '@/core/domain/manager/SpawnManager';
import Monster from '@/core/domain/entities/game/mob/Monster';
import Stone from '@/core/domain/entities/game/mob/Stone';

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
    def: '0',
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

const makeStone = (protoOverrides: Record<string, unknown> = {}) =>
    new Stone(
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
            eventTimerManager: {
                addTimer: () => {},
                removeAllTimersFromOwner: () => {},
                isTimerActive: () => false,
            } as any,
            groups: [],
        },
    );

const makeMonster = (protoOverrides: Record<string, unknown> = {}) =>
    new Monster(
        {
            proto: makeProto({ type: 'MONSTER', ...protoOverrides }) as any,
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
            eventTimerManager: {
                addTimer: () => {},
                removeAllTimersFromOwner: () => {},
                isTimerActive: () => false,
            } as any,
        },
    );

describe('SpawnManager (issue #266)', () => {
    let tmpDir: string;
    let spawnDir: string;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'spawn-manager-'));
        spawnDir = path.join(tmpDir, 'src', 'core', 'infra', 'config', 'data', 'spawn', 'test_area');
        fs.mkdirSync(spawnDir, { recursive: true });
        sinon.stub(process, 'cwd').returns(tmpDir);
    });

    afterEach(() => {
        sinon.restore();
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('spawns a metin stone instead of silently dropping it (Stone is a sibling of Monster, not a subclass)', async () => {
        fs.writeFileSync(
            path.join(spawnDir, 'stone.json'),
            JSON.stringify([
                {
                    type: 'm',
                    x: '10',
                    y: '10',
                    rangeX: '0',
                    rangeY: '0',
                    z: '0',
                    direction: '0',
                    spawnTime: '600s',
                    percent: '100',
                    count: '1',
                    vnum: '8001',
                },
            ]),
        );

        const stone = makeStone();
        const entityManager = { createMob: sinon.stub().returns(stone) } as any;
        const spawnManager = new SpawnManager({
            logger: { error: sinon.stub(), debug: sinon.stub(), info: sinon.stub() } as any,
            config: { groups: [], groupsCollection: [] } as any,
            entityManager,
        });

        const entities = await spawnManager.getEntities('test_area');

        expect(entities).to.have.lengthOf(1);
        expect(entities[0]).to.equal(stone);
    });

    it('still spawns a regular monster the same way as before', async () => {
        fs.writeFileSync(
            path.join(spawnDir, 'regen.json'),
            JSON.stringify([
                {
                    type: 'm',
                    x: '10',
                    y: '10',
                    rangeX: '0',
                    rangeY: '0',
                    z: '0',
                    direction: '0',
                    spawnTime: '600s',
                    percent: '100',
                    count: '1',
                    vnum: '101',
                },
            ]),
        );

        const monster = makeMonster();
        const entityManager = { createMob: sinon.stub().returns(monster) } as any;
        const spawnManager = new SpawnManager({
            logger: { error: sinon.stub(), debug: sinon.stub(), info: sinon.stub() } as any,
            config: { groups: [], groupsCollection: [] } as any,
            entityManager,
        });

        const entities = await spawnManager.getEntities('test_area');

        expect(entities).to.have.lengthOf(1);
        expect(entities[0]).to.equal(monster);
    });

    it('logs and drops anything that is neither a Monster nor a Stone, instead of throwing', async () => {
        fs.writeFileSync(
            path.join(spawnDir, 'regen.json'),
            JSON.stringify([
                {
                    type: 'm',
                    x: '10',
                    y: '10',
                    rangeX: '0',
                    rangeY: '0',
                    z: '0',
                    direction: '0',
                    spawnTime: '600s',
                    percent: '100',
                    count: '1',
                    vnum: '999',
                },
            ]),
        );

        const entityManager = { createMob: sinon.stub().returns({ constructor: { name: 'NPC' } }) } as any;
        const logger = { error: sinon.stub(), debug: sinon.stub(), info: sinon.stub() };
        const spawnManager = new SpawnManager({
            logger: logger as any,
            config: { groups: [], groupsCollection: [] } as any,
            entityManager,
        });

        const entities = await spawnManager.getEntities('test_area');

        expect(entities).to.have.lengthOf(0);
        expect(logger.error.calledOnce).to.be.true;
    });
});
