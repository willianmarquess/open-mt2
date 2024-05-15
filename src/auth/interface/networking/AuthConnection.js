import ConnectionStateEnum from '../../../core/enum/ConnectionStateEnum.js';
import Connection from '../../../core/interface/networking/Connection.js';

export default class AuthConnection extends Connection {
    onHandshakeSuccess() {
        this.logger.info('[HANDSHAKE] Finished');
        this.state = ConnectionStateEnum.AUTH;
    }

    send(packet) {
        this.logger.debug(`[OUT][PACKET] name: ${packet.name}`);
        this.socket.write(packet.pack());
    }
}
