import { ConnectionStateEnum } from '../../../core/enum/ConnectionStateEnum';
import Connection from '../../../core/interface/networking/Connection';

export default class AuthConnection extends Connection {
    onHandshakeSuccess() {
        this.logger.info('[HANDSHAKE] Finished');
        this.setState(ConnectionStateEnum.AUTH);
    }

    send<T>(packet: T & { pack: () => Buffer; getName: () => string }) {
        this.logger.debug(`[OUT][PACKET] name: ${packet.getName()}`);
        this.socket.write(packet.pack());
    }
}
