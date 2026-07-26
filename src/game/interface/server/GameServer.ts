import World from '@/core/domain/World';
import Server from '../../../core/interface/server/Server';
import GameConnection from '@/game/interface/networking/GameConnection';
import { Socket } from 'net';
import { Logger } from 'winston';
import { GameConfig } from '@/game/infra/config/GameConfig';
import { PacketMapValue } from '@/core/interface/networking/packets/Packets';
import LogoutService from '@/game/app/service/LogoutService';

export default class GameServer extends Server {
    private readonly world: World;
    private readonly logoutService: LogoutService;

    constructor(container: {
        logger: Logger;
        config: GameConfig;
        packets: Map<number, PacketMapValue<any>>;
        world: World;
        logoutService: LogoutService;
    }) {
        super(container);
        this.world = container.world;
        this.logoutService = container.logoutService;
    }

    async onClose(connection: GameConnection) {
        const player = connection.getPlayer();

        if (player) {
            await this.logoutService
                .execute(player)
                .catch((err) => this.logger.error(`[GameServer] Error despawning player on disconnect: ${err}`));
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

        const { createPacket, createHandler } = packetBuilder;
        const packet = createPacket({});
        const handler = createHandler(this.container);
        this.logger.debug(`[IN][PACKET] processing packet: ${handler.constructor.name}`);

        // A malformed packet (e.g. lying about its item count) makes unpack read
        // past the buffer and throw. Without this guard the rejection escapes the
        // 'data' listener as an unhandledRejection and kills the whole server.
        let unpacked: typeof packet;
        try {
            unpacked = packet.unpack(data);
        } catch (error) {
            this.logger.error(
                `[IN][PACKET] Malformed ${packet.getName()} packet from connection: ID: ${connection.getId()}, closing. ${error}`,
            );
            connection.close();
            return;
        }

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
