import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
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
        console.log('ConnectionStatePacket: #buffer', this.bufferWriter.buffer);
        return this.bufferWriter.buffer;
    }
}
