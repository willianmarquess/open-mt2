import World from '@/core/domain/World';
import Server from '../../../core/interface/server/Server';
import GameConnection from '@/game/interface/networking/GameConnection';
import { Socket } from 'node:net';
import { Logger } from 'winston';
import { GameConfig } from '@/game/infra/config/GameConfig';
import { PacketMapValue } from '@/core/interface/networking/packets/Packets';
import LogoutService from '@/game/app/service/LogoutService';
import SessionManager from '@/game/domain/manager/SessionManager';

export default class GameServer extends Server {
    private readonly world: World;
    private readonly logoutService: LogoutService;
    private readonly sessionManager: SessionManager;

    constructor(container: {
        logger: Logger;
        config: GameConfig;
        packets: Map<number, PacketMapValue<any>>;
        world: World;
        logoutService: LogoutService;
        sessionManager: SessionManager;
    }) {
        super(container);
        this.world = container.world;
        this.logoutService = container.logoutService;
        this.sessionManager = container.sessionManager;
    }

    async onClose(connection: GameConnection) {
        this.sessionManager.remove(connection);

        const player = connection.getPlayer();

        if (player) {
            await this.logoutService
                .execute(player)
                .catch((err) => this.logger.error(`[GameServer] Error despawning player on disconnect: ${err}`));
            connection.clearPlayer();
        }

        await super.onClose(connection);
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
