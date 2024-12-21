import Packet from '@/core/interface/networking/packets/packet/Packet';
import Server from '../../../core/interface/server/Server';
import Queue from '../../../core/util/Queue';
import GameConnection from '@/game/interface/networking/GameConnection';
import PacketHandler from '@/core/interface/networking/packets/packet/PacketHandler';
import { Socket } from 'net';
import LogoutService from '@/game/app/service/LogoutService';

const INCOMING_MESSAGES_QUEUE_SIZE = 5_000;

type InMessage = {
    packet: Packet;
    handler: PacketHandler<Packet>;
    connection: GameConnection;
};

export default class GameServer extends Server {
    #incomingMessages = new Queue<InMessage>(INCOMING_MESSAGES_QUEUE_SIZE);
    #logoutService: LogoutService;

    constructor(container) {
        super(container);
        this.#logoutService = container.logoutService;
    }

    async onData(connection: GameConnection, data: Buffer) {
        this.container.containerInstance.createScope();
        this.logger.debug(`[IN][DATA SOCKET EVENT] Data received from ID: ${connection.getId()}`);

        const header = data[0];
        const packetExists = this.packets.has(header);

        if (!packetExists) {
            this.logger.info(`[IN][PACKET] Unknown header packet: ${data[0]}`);
            return;
        }

        const { createPacket, createHandler } = this.packets.get(header);
        const packet = createPacket({});
        const handler = createHandler(this.container);
        const message: InMessage = {
            packet: packet.unpack(data),
            handler,
            connection,
        };
        this.#incomingMessages.enqueue(message);
    }

    processMessages() {
        for (const { packet, handler, connection } of this.#incomingMessages.dequeueIterator()) {
            this.logger.debug(`[IN][PACKET] processing packet: ${handler.constructor.name}`);
            handler.execute(connection, packet).catch((err) => this.logger.error(err));
        }
    }

    sendPendingMessages() {
        for (const connection of this.connections.values()) {
            (connection as GameConnection).sendPendingMessages().catch((err) => this.logger.error(err));
        }
    }

    createConnection(socket: Socket) {
        return new GameConnection({
            socket,
            logger: this.logger,
            logoutService: this.#logoutService,
            config: this.config,
        });
    }

    async onClose(connection: GameConnection) {
        super.onClose(connection);
        if (!this.isShuttingDown) {
            await connection.onClose();
        }
    }
}
