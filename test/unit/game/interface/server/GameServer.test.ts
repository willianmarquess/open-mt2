import { expect } from 'chai';
import sinon from 'sinon';
import GameServer from '@/game/interface/server/GameServer';

const logger: any = { info: () => {}, error: () => {}, debug: () => {} };

const createSessionManager = () => ({ remove: sinon.stub() }) as any;

const createGameServer = (logoutService: any, sessionManager: any = createSessionManager()) => {
    return new GameServer({
        logger,
        config: {} as any,
        packets: new Map(),
        world: {} as any,
        logoutService,
        sessionManager,
    });
};

const createConnection = (player: unknown) =>
    ({
        getId: () => 'connection-id',
        getPlayer: () => player,
        getAccountId: () => 1,
        clearPlayer: sinon.stub(),
        stopKeepalive: sinon.stub(),
        getTokenKey: () => null,
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

        it('should drop the player reference so a late packet cannot act on it (issue #91)', async () => {
            const logoutService = { execute: sinon.stub().resolves() };
            const server = createGameServer(logoutService);
            const connection = createConnection({ getName: () => 'Test' });

            await server.onClose(connection);

            expect(connection.clearPlayer.calledOnce).to.be.equal(true);
        });

        it('should release the account session so the player can log in again (issue #105)', async () => {
            const logoutService = { execute: sinon.stub().resolves() };
            const sessionManager = createSessionManager();
            const server = createGameServer(logoutService, sessionManager);
            const connection = createConnection({ getName: () => 'Test' });

            await server.onClose(connection);

            expect(sessionManager.remove.calledOnceWith(connection)).to.be.equal(true);
        });

        it('should release the account session even when no character was selected', async () => {
            const logoutService = { execute: sinon.stub().resolves() };
            const sessionManager = createSessionManager();
            const server = createGameServer(logoutService, sessionManager);
            const connection = createConnection(null);

            await server.onClose(connection);

            expect(sessionManager.remove.calledOnceWith(connection), 'a session dies at TOKEN too').to.be.equal(true);
        });
    });
});
