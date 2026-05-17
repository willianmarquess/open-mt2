import World from '@/core/domain/World';
import Server from '../../../core/interface/server/Server';
import GameConnection from '@/game/interface/networking/GameConnection';
import { Socket } from 'net';
import { Logger } from 'winston';
import { GameConfig } from '@/game/infra/config/GameConfig';
import { PacketMapValue } from '@/core/interface/networking/packets/Packets';

export default class GameServer extends Server {
    private readonly world: World;

    constructor(container: {
        logger: Logger;
        config: GameConfig;
        packets: Map<number, PacketMapValue<any>>;
        world: World;
    }) {
        super(container);
        this.world = container.world;
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
        handler.execute(connection, packet.unpack(data)).catch((err) => this.logger.error(err));
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
