import Server from '../../../core/interface/server/Server.js';
import Queue from '../../../core/util/Queue.js';
import GameConnection from '../networking/GameConnection.js';

const INCOMING_MESSAGES_QUEUE_SIZE = 1000;

export default class GameServer extends Server {
    #incomingMessages = new Queue(INCOMING_MESSAGES_QUEUE_SIZE);

    async onData(connection, data) {
        this.container.containerInstance.createScope();
        this.logger.debug(`[IN][DATA SOCKET EVENT] Data received from ID: ${connection.id}`);

        const header = data[0];
        const packetExists = this.packets.has(header);

        if (!packetExists) {
            this.logger.debug(`[IN][PACKET] Unknow header packet: ${data[0]}`);
            return;
        }

        const { packet, createHandler } = this.packets.get(header);

        this.#incomingMessages.enqueue({
            packet: packet.unpack(data),
            handler: createHandler(this.container),
            connection,
        });
    }

    processMessages() {
        for (const { packet, handler, connection } of this.#incomingMessages.dequeueIterator()) {
            handler.execute(connection, packet).catch((err) => this.logger.error(err));
        }
    }

    sendPendingMessages() {
        for (const connection of this.connections.values()) {
            connection.sendPendingMessages().catch((err) => this.logger.error(err));
        }
    }

    createConnection(socket) {
        return new GameConnection({
            socket,
            logger: this.logger,
            packets: this.packets,
        });
    }
}
