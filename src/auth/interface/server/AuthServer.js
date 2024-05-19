import AuthConnection from '../networking/AuthConnection.js';
import Server from '../../../core/interface/server/Server.js';

export default class AuthServer extends Server {
    async onData(connection, data) {
        this.container.containerInstance.createScope();
        this.logger.debug(`[IN][DATA SOCKET EVENT] Data received from ID: ${connection.id}`);

        const header = data[0];
        const packetExists = this.packets.has(header);

        if (!packetExists) {
            this.logger.debug(`[IN][PACKET] Unknow header packet: ${data[0]}`);
            return;
        }

        const { createPacket, createHandler } = this.packets.get(header);
        const packet = createPacket();
        const handler = createHandler(this.container);
        this.logger.debug(`[IN][PACKET] name: ${handler.constructor.name}`);
        handler.execute(connection, packet.unpack(data)).catch((err) => this.logger.error(err));
    }

    createConnection(socket) {
        return new AuthConnection({
            socket,
            logger: this.logger,
            packets: this.packets,
        });
    }
}
