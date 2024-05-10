import { randomBytes } from 'crypto';
import Connection from '../../../core/interface/networking/Connection.js';
import HandshakePacket from '../../../core/interface/networking/packets/packet/bidirectional/HandshakePacket.js';

export default class AuthConnection extends Connection {
    startHandShake() {
        const id = randomBytes(4).readUInt32LE();
        this.send(
            new HandshakePacket({
                id,
                time: performance.now(),
                delta: 0,
            }),
        );
    }
}
