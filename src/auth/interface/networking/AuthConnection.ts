import { ConnectionStateEnum } from '../../../core/enum/ConnectionStateEnum';
import Connection from '../../../core/interface/networking/Connection';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

export default class AuthConnection extends Connection {
    onHandshakeSuccess() {
        this.logger.info('[HANDSHAKE] Finished');
        this.setState(ConnectionStateEnum.AUTH);
    }

    send(packet: PacketOut) {
        this.logger.debug(`[OUT][PACKET] name: ${packet.getName()}`);
        this.socket.write(packet.pack());
    }
}
