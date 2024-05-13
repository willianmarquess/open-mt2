import ConnectionStatePacket from '../../../core/interface/networking/packets/packet/out/ConnectionStatePacket.js';
import Server from '../../../core/interface/server/Server.js';
import GameConnection from '../networking/GameConnection.js';

export default class GameServer extends Server {
    onListener(socket) {
        const connection = new GameConnection({
            socket,
            logger: this.logger,
            packets: this.packets,
        });
        this.connections.set(connection.id, connection);

        this.logger.debug(`[IN][CONNECT SOCKET EVENT] New connection: ID: ${connection.id}`);
        connection.state = ConnectionStatePacket.HANDSHAKE;
        connection.startHandShake();

        socket.on('close', this.onClose.bind(this, connection));
        socket.on('data', this.onData.bind(this, connection));
    }
}
