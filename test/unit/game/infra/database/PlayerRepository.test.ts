import { expect } from 'chai';
import sinon from 'sinon';
import PlayerRepository from '@/game/infra/database/PlayerRepository';
import { PlayerState } from '@/core/domain/entities/state/player/PlayerState';

const makePlayerState = (overrides: Record<string, unknown> = {}) =>
    new PlayerState({
        id: 1,
        accountId: 1,
        empire: 1,
        playerClass: 0,
        skillGroup: 0,
        playTime: 0,
        level: 1,
        experience: 0,
        gold: 0,
        st: 0,
        ht: 0,
        dx: 0,
        iq: 0,
        positionX: 0,
        positionY: 0,
        health: 100,
        mana: 100,
        stamina: 100,
        bodyPart: 0,
        hairPart: 0,
        name: 'test',
        givenStatusPoints: 0,
        availableStatusPoints: 0,
        availableSkillPoints: 0,
        slot: 0,
        skills: [],
        ...overrides,
    } as any);

describe('PlayerRepository quick slot persistence (moved from a dedicated table to a JSON column, same as skills)', () => {
    afterEach(() => sinon.restore());

    describe('create', () => {
        it('serializes the quickSlot Map into a JSON array of {slot, type, position}, bound as the last param', () => {
            const quickSlot = new Map([
                [0, { type: 1, position: 5 }],
                [3, { type: 2, position: 8 }],
            ]);
            const player = makePlayerState({ quickSlot });

            const execute = sinon.stub().resolves([{ insertId: 42 }]);
            const databaseManager = { getConnection: () => ({ execute }) } as any;

            new PlayerRepository({ databaseManager }).create(player);

            const boundParams = execute.firstCall.args[1] as Array<unknown>;
            const quickSlotJson = boundParams[boundParams.length - 1] as string;

            expect(JSON.parse(quickSlotJson)).to.deep.equal([
                { slot: 0, type: 1, position: 5 },
                { slot: 3, type: 2, position: 8 },
            ]);
        });

        it('serializes an empty quickSlot Map as an empty JSON array', () => {
            const player = makePlayerState({ quickSlot: new Map() });

            const execute = sinon.stub().resolves([{ insertId: 42 }]);
            const databaseManager = { getConnection: () => ({ execute }) } as any;

            new PlayerRepository({ databaseManager }).create(player);

            const boundParams = execute.firstCall.args[1] as Array<unknown>;
            expect(boundParams[boundParams.length - 1]).to.equal('[]');
        });
    });

    describe('update', () => {
        it('serializes the quickSlot Map the same way as create', async () => {
            const quickSlot = new Map([[1, { type: 1, position: 0 }]]);
            const player = makePlayerState({ quickSlot });

            const query = sinon.stub().resolves([{}]);
            const databaseManager = { getConnection: () => ({ query }) } as any;

            await new PlayerRepository({ databaseManager }).update(player);

            const boundParams = query.firstCall.args[1] as Array<unknown>;
            // last param is the WHERE id = ? binding, quickSlot is the one right before it
            const quickSlotJson = boundParams[boundParams.length - 2] as string;
            expect(JSON.parse(quickSlotJson)).to.deep.equal([{ slot: 1, type: 1, position: 0 }]);
        });
    });

    describe('getById', () => {
        it('reconstructs the quickSlot Map from the row (mysql2 auto-parses the JSON column)', async () => {
            const row = {
                id: 1,
                accountId: 1,
                empire: 1,
                playerClass: 0,
                skillGroup: 0,
                playTime: 0,
                level: 1,
                experience: 0,
                gold: 0,
                st: 0,
                ht: 0,
                dx: 0,
                iq: 0,
                positionX: 0,
                positionY: 0,
                health: 100,
                mana: 100,
                stamina: 100,
                bodyPart: 0,
                hairPart: 0,
                name: 'test',
                givenStatusPoints: 0,
                availableStatusPoints: 0,
                availableSkillPoints: 0,
                slot: 0,
                skills: [],
                quickSlot: [
                    { slot: 2, type: 1, position: 4 },
                    { slot: 5, type: 2, position: 7 },
                ],
            };

            const query = sinon.stub().resolves([[row]]);
            const databaseManager = { getConnection: () => ({ query }) } as any;

            const result = await new PlayerRepository({ databaseManager }).getById(1);

            expect(result).to.not.be.null;
            expect(result!.quickSlot).to.be.instanceOf(Map);
            expect(result!.quickSlot.get(2)).to.deep.equal({ type: 1, position: 4 });
            expect(result!.quickSlot.get(5)).to.deep.equal({ type: 2, position: 7 });
            expect(result!.quickSlot.size).to.equal(2);
        });

        it('reconstructs an empty Map when the row has no quick slots set', async () => {
            const row = {
                id: 1,
                accountId: 1,
                empire: 1,
                playerClass: 0,
                skillGroup: 0,
                playTime: 0,
                level: 1,
                experience: 0,
                gold: 0,
                st: 0,
                ht: 0,
                dx: 0,
                iq: 0,
                positionX: 0,
                positionY: 0,
                health: 100,
                mana: 100,
                stamina: 100,
                bodyPart: 0,
                hairPart: 0,
                name: 'test',
                givenStatusPoints: 0,
                availableStatusPoints: 0,
                availableSkillPoints: 0,
                slot: 0,
                skills: [],
                quickSlot: [],
            };

            const query = sinon.stub().resolves([[row]]);
            const databaseManager = { getConnection: () => ({ query }) } as any;

            const result = await new PlayerRepository({ databaseManager }).getById(1);

            expect(result!.quickSlot).to.be.instanceOf(Map);
            expect(result!.quickSlot.size).to.equal(0);
        });

        it('returns null when no row is found', async () => {
            const query = sinon.stub().resolves([[]]);
            const databaseManager = { getConnection: () => ({ query }) } as any;

            const result = await new PlayerRepository({ databaseManager }).getById(999);

            expect(result).to.be.null;
        });
    });
});

describe('PlayerRepository sub-skill persistence (#209)', () => {
    for (const balance of [0, 7]) {
        it(`writes and reads balance ${balance}`, async () => {
            const state = makePlayerState({ subSkill: balance });
            const execute = sinon.stub().resolves([{ insertId: 42 }]);
            const query = sinon.stub().resolves([{}]);
            const repository = new PlayerRepository({
                databaseManager: {
                    getConnection: () => ({ execute, query }),
                } as any,
            });
            await repository.create(state);
            const [sql, params] = execute.firstCall.args;
            const columns = sql
                .match(/game\.player\s*\(([^)]+)\)/i)[1]
                .split(',')
                .map((s: string) => s.trim());
            expect(columns).to.include('subSkill');
            expect(params[columns.indexOf('subSkill')]).to.equal(balance);
            await repository.update(state);
            const [update, values] = query.firstCall.args;
            const assignments = update.split(/set/i)[1].split(/where/i)[0].split(',');
            const index = assignments.findIndex((s: string) => s.trim().startsWith('subSkill ='));
            expect(index).to.be.at.least(0);
            expect(values[index]).to.equal(balance);
            query.resolves([[{ ...state, skills: [], quickSlot: [], subSkill: balance }]]);
            const loaded = await repository.getById(42);
            expect((loaded as any).subSkill).to.equal(balance);
        });
    }
});

describe('PlayerRepository SQL field mapping', () => {
    const columns = [
        'accountId',
        'createdAt',
        'updatedAt',
        'empire',
        'playerClass',
        'skillGroup',
        'playTime',
        'level',
        'experience',
        'gold',
        'st',
        'ht',
        'dx',
        'iq',
        'positionX',
        'positionY',
        'health',
        'mana',
        'stamina',
        'bodyPart',
        'hairPart',
        'name',
        'givenStatusPoints',
        'availableStatusPoints',
        'availableSkillPoints',
        'subSkill',
        'slot',
        'horseLevel',
        'horseHealth',
        'horseStamina',
        'horseName',
        'horseRiding',
        'skills',
        'quickSlot',
    ];

    for (const scenario of ['distinct values', 'zero values', 'null and undefined values']) {
        it(`preserves every INSERT/UPDATE column and parameter for ${scenario}`, async () => {
            const values: Record<string, any> = {};
            columns.forEach((column, index) => {
                values[column] = scenario === 'zero values' ? 0 : index + 10;
            });
            Object.assign(values, {
                createdAt: new Date('2026-01-02T03:04:05Z'),
                updatedAt: new Date('2026-02-03T04:05:06Z'),
                name: 'Mapping',
                horseName: '',
                skills: [{ rank: 0, level: 2, timeToNextRead: 3, readCount: 4 }],
                quickSlot: new Map([[3, { type: 1, position: 5 }]]),
            });
            if (scenario === 'null and undefined values')
                Object.assign(values, { horseName: null, createdAt: null, updatedAt: undefined, subSkill: undefined });
            const player = { ...makePlayerState(), ...values, id: 404 } as PlayerState;
            const expected = {
                ...values,
                skills: JSON.stringify(values.skills),
                quickSlot: '[{"slot":3,"type":1,"position":5}]',
            };
            const execute = sinon.stub().resolves([{ insertId: 501 }]);
            const query = sinon.stub().resolves([{}]);
            const repository = new PlayerRepository({
                databaseManager: { getConnection: () => ({ execute, query }) } as any,
            });
            expect(await repository.create(player)).to.equal(501);
            await repository.update(player);
            const [insertSql, insertParams] = execute.firstCall.args;
            const insertColumns = insertSql
                .match(/game\.player\s*\(([^)]+)\)/i)[1]
                .split(',')
                .map((s: string) => s.trim());
            const [updateSql, updateParams] = query.firstCall.args;
            const updateColumns = updateSql
                .match(/SET\s+([\s\S]+?)\s+WHERE id = \?/i)[1]
                .split(',')
                .map((s: string) => s.trim().replace(/ = \?$/, ''));
            expect(insertColumns).to.deep.equal(columns);
            expect(updateColumns).to.deep.equal(columns);
            expect(insertSql.match(/\?/g)).to.have.length(columns.length);
            expect(updateSql.match(/\?/g)).to.have.length(columns.length + 1);
            expect(insertParams).to.deep.equal(columns.map((column) => expected[column]));
            expect(updateParams).to.deep.equal([...insertParams, 404]);
        });
    }
});
