import ConnectionState from '../../../core/enum/ConnectionStateEnum.js';
import AuthConnection from '../networking/AuthConnection.js';
import Server from '../../../core/interface/server/Server.js';

export default class AuthServer extends Server {
    onListener(socket) {
        const connection = new AuthConnection({
            socket,
            logger: this.logger,
            packets: this.packets,
        });
        this.connections.set(connection.id, connection);

        this.logger.debug(`[IN][CONNECT SOCKET EVENT] New connection: ID: ${connection.id}`);
        connection.state = ConnectionState.HANDSHAKE;
        connection.startHandShake();

        socket.on('close', this.onClose.bind(this, connection));
        socket.on('data', this.onData.bind(this, connection));
    }
}
