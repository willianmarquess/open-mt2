import PacketHeaderEnum from '../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

export default class ConnectionStatePacket extends PacketOut {
    #state;

    constructor({ state } = {}) {
        super({
            header: PacketHeaderEnum.CONNECTION_STATE,
            name: 'ConnectionStatePacket',
            size: 2,
        });
        this.#state = state;
    }

    pack() {
        this.bufferWriter.writeUint8(this.#state);
        // const buffer = Buffer.alloc(this.length);
        // buffer[0] = this.header;
        // buffer[1] = this.#state;
        return this.bufferWriter.buffer;
    }

    static unpack(buffer) {
        const state = buffer[1];
        return new ConnectionStatePacket({
            state,
        });
    }
}
