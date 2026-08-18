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
