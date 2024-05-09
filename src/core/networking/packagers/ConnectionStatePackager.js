import ConnectionStatePacket from '../packets/ConnectionStatePacket.js';
import Packager from './Packager.js';

export default class ConnectionStatePackager extends Packager {
    constructor() {
        super({
            header: 0xfd,
            name: 'ConnectionStatePacket',
            length: 2,
        });
    }

    pack(packet) {
        const buffer = Buffer.alloc(this.length);
        buffer[0] = this.header;
        buffer[1] = packet.state;
        return buffer;
    }

    unpack(buffer) {
        const state = buffer[1];
        return new ConnectionStatePacket({
            state,
        });
    }
}
