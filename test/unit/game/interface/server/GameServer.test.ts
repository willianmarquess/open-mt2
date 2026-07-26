import { expect } from 'chai';
import sinon from 'sinon';
import GameServer from '@/game/interface/server/GameServer';

const logger: any = { info: () => {}, error: () => {}, debug: () => {} };

const createGameServer = (logoutService: any) => {
    return new GameServer({
        logger,
        config: {} as any,
        packets: new Map(),
        world: {} as any,
        logoutService,
    });
};

const createConnection = (player: unknown) =>
    ({
        getId: () => 'connection-id',
        getPlayer: () => player,
    }) as any;

describe('GameServer', () => {
    describe('onClose', () => {
        it('should despawn the player when the connection closes', async () => {
            const logoutService = { execute: sinon.stub().resolves() };
            const server = createGameServer(logoutService);
            const player = { getName: () => 'Test' };

            await server.onClose(createConnection(player));

            expect(logoutService.execute.calledOnceWith(player)).to.be.equal(true);
        });

        it('should not call logout when the connection has no player selected', async () => {
            const logoutService = { execute: sinon.stub().resolves() };
            const server = createGameServer(logoutService);

            await server.onClose(createConnection(null));

            expect(logoutService.execute.called).to.be.equal(false);
        });

        it('should not throw when the logout fails', async () => {
            const logoutService = { execute: sinon.stub().rejects(new Error('boom')) };
            const server = createGameServer(logoutService);

            await server.onClose(createConnection({ getName: () => 'Test' }));

            expect(logoutService.execute.calledOnce).to.be.equal(true);
        });
    });
});
