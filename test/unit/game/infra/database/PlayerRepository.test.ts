import { expect } from 'chai';
import sinon from 'sinon';
import PlayerRepository from '@/game/infra/database/PlayerRepository';
import PlayerState from '@/core/domain/entities/state/player/PlayerState';

const PLAYER_ID = 42;

const createRepository = () => {
    const queries: Array<string> = [];
    const params: Array<Array<unknown>> = [];

    const connection = {
        query: sinon.stub().callsFake((sql: string, values: Array<unknown>) => {
            queries.push(sql);
            params.push(values);
            return Promise.resolve([{ insertId: PLAYER_ID }]);
        }),
        execute: sinon.stub().resolves([{ insertId: PLAYER_ID }]),
    };

    const playerRepository = new PlayerRepository({
        databaseManager: { getConnection: () => connection } as any,
    });

    return { playerRepository, queries, params };
};

const createPlayerState = (quickSlot: Map<number, { type: number; position: number }>) =>
    ({ id: PLAYER_ID, quickSlot }) as unknown as PlayerState;

const quickSlotQueries = (queries: Array<string>) => queries.filter((sql) => sql.includes('game.quick_slot'));

describe('PlayerRepository quick slots (issue #121)', () => {
    it('should delete the stored rows when the last quick slot is cleared', async () => {
        const { playerRepository, queries, params } = createRepository();

        await playerRepository.update(createPlayerState(new Map()));

        const touched = quickSlotQueries(queries);

        expect(touched).to.have.length(1);
        expect(touched[0]).to.contain('DELETE FROM game.quick_slot');
        expect(params[params.length - 1]).to.be.deep.equal([PLAYER_ID]);
    });

    it('should replace the stored rows when quick slots remain', async () => {
        const { playerRepository, queries } = createRepository();

        await playerRepository.update(createPlayerState(new Map([[0, { type: 1, position: 3 }]])));

        const touched = quickSlotQueries(queries);

        expect(touched).to.have.length(2);
        expect(touched[0]).to.contain('DELETE FROM game.quick_slot');
        expect(touched[1]).to.contain('INSERT INTO game.quick_slot');
    });

    it('should not touch the table while creating a character with no quick slots', async () => {
        const { playerRepository, queries } = createRepository();

        await playerRepository.create(createPlayerState(new Map()));

        expect(quickSlotQueries(queries)).to.have.length(0);
    });
});
