import Server from '@/core/interface/server/Server';
import AuthConnection from '@/auth/interface/networking/AuthConnection';
import { Socket } from 'node:net';

export default class AuthServer extends Server {
    async onData(connection: AuthConnection, data: Buffer) {
        this.container.containerInstance.createScope();
        this.logger.debug(`[IN][DATA SOCKET EVENT] Data received from ID: ${connection.getId()}`);

        const header = data[0];
        const packetBuilder = this.packets.get(header);

        if (!packetBuilder) {
            this.logger.debug(`[IN][PACKET] Unknown header packet: ${data[0]}`);
            return;
        }

        const { createPacket, createHandler } = packetBuilder;
        const packet = createPacket({});
        const handler = createHandler(this.container);
        this.logger.debug(`[IN][PACKET] name: ${handler.constructor.name}`);

        // A malformed packet makes unpack read past the buffer and throw; the
        // rejection would escape the 'data' listener and kill the process.
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

        handler.execute(connection, unpacked).catch((err) => this.logger.error(err));
    }

    createConnection(socket: Socket) {
        return new AuthConnection({
            socket,
            logger: this.logger,
        });
    }
}
