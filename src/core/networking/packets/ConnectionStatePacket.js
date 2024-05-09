import PacketHeader from '../../enum/PacketHeader.js';
import Packet from './Packet.js';

export default class ConnectionStatePacket extends Packet {
    #state;

    constructor({ state } = {}) {
        super({
            header: PacketHeader.CONNECTION_STATE,
            name: 'ConnectionStatePacket',
            length: 2,
        });
        this.#state = state;
    }

    pack() {
        const buffer = Buffer.alloc(this.length);
        buffer[0] = this.header;
        buffer[1] = this.#state;
        return buffer;
    }

    static unpack(buffer) {
        const state = buffer[1];
        return new ConnectionStatePacket({
            state,
        });
    }
}
