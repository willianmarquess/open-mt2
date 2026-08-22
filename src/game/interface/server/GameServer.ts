import World from '@/core/domain/World';
import Server from '../../../core/interface/server/Server';
import GameConnection from '@/game/interface/networking/GameConnection';
import { Socket } from 'node:net';
import { Logger } from 'winston';
import { GameConfig } from '@/game/infra/config/GameConfig';
import { PacketMapValue } from '@/core/interface/networking/packets/Packets';
import LogoutService from '@/game/app/service/LogoutService';
import SessionManager from '@/game/domain/manager/SessionManager';
import CacheProvider from '@/core/infra/cache/CacheProvider';

const TOKEN_GRACE_SECS = 60;

export default class GameServer extends Server {
    private readonly world: World;
    private readonly logoutService: LogoutService;
    private readonly sessionManager: SessionManager;
    private readonly cacheProvider: CacheProvider;

    constructor(container: {
        logger: Logger;
        config: GameConfig;
        packets: Map<number, PacketMapValue<any>>;
        world: World;
        logoutService: LogoutService;
        sessionManager: SessionManager;
        cacheProvider: CacheProvider;
    }) {
        super(container);
        this.world = container.world;
        this.logoutService = container.logoutService;
        this.sessionManager = container.sessionManager;
        this.cacheProvider = container.cacheProvider;
    }

    async onClose(connection: GameConnection) {
        this.sessionManager.remove(connection);
        await this.startTokenGracePeriod(connection);

        const player = connection.getPlayer();

        if (player) {
            await this.logoutService
                .execute(player)
                .catch((err) => this.logger.error(`[GameServer] Error despawning player on disconnect: ${err}`));
            connection.clearPlayer();
        }

        await super.onClose(connection);
    }

    // The stock client authenticates on two connections in a row, so the key may
    // only start counting down once the account has no live connection left.
    private async startTokenGracePeriod(connection: GameConnection) {
        const tokenKey = connection.getTokenKey();
        const accountId = connection.getAccountId();

        if (!tokenKey || accountId === null) return;
        if (this.sessionManager.get(accountId)) return;

        await this.cacheProvider
            .expire(tokenKey, TOKEN_GRACE_SECS)
            .catch((err) => this.logger.error(`[GameServer] Error expiring the login token: ${err}`));
    }

    async onData(connection: GameConnection, data: Buffer) {
        this.container.containerInstance.createScope();
        this.logger.debug(`[IN][DATA SOCKET EVENT] Data received from ID: ${connection.getId()}`);
        const header = data[0];
        const packetBuilder = this.packets.get(header);

        if (!packetBuilder) {
            this.logger.info(`[IN][PACKET] Unknown header packet: ${data[0]}`);
            return;
        }

        if (!this.isAllowedInPhase(connection, header, packetBuilder)) return;

        const { createPacket } = packetBuilder;
        const packet = createPacket({});
        const handler = this.createHandlerFor(connection, header, packetBuilder);
        if (!handler) return;
        this.logger.debug(`[IN][PACKET] processing packet: ${handler.constructor.name}`);

        const unpacked = this.unpackPacket(connection, packet, data);
        if (!unpacked) return;

        connection.cork();
        await handler
            .execute(connection, unpacked)
            .catch((err) => this.logger.error(err))
            .finally(() => {
                connection.uncork();
            });
    }

    createConnection(socket: Socket) {
        return new GameConnection({
            socket,
            logger: this.logger,
        });
    }

    async close(): Promise<void> {
        await this.world.close();
        return super.close();
    }
}
