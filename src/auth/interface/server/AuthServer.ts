import Server from '@/core/interface/server/Server';
import AuthConnection from '@/auth/interface/networking/AuthConnection';
import { Socket } from 'node:net';

export default class AuthServer extends Server {
    async onData(connection: AuthConnection, data: Buffer) {
        this.container.containerInstance.createScope();
        this.logger.debug(`[IN][DATA SOCKET EVENT] Data received from ID: ${connection.getId()}`);

        const header = data[0];
        const packetExists = this.packets.has(header);

        if (!packetExists) {
            this.logger.debug(`[IN][PACKET] Unknown header packet: ${data[0]}`);
            return;
        }

        const { createPacket, createHandler } = this.packets.get(header);
        const packet = createPacket();
        const handler = createHandler(this.container);
        this.logger.debug(`[IN][PACKET] name: ${handler.constructor.name}`);
        handler.execute(connection, packet.unpack(data)).catch((err) => this.logger.error(err));
    }

    createConnection(socket: Socket) {
        return new AuthConnection({
            socket,
            logger: this.logger,
        });
    }
}
