import BufferWriter from '../../../buffer/BufferWriter.js';
import Packet from '../Packet.js';

export default class PacketBidirectional extends Packet {
    #bufferWriter;

    constructor({ header, subHeader, size, name }) {
        super({ header, subHeader, size, name });
        this.#bufferWriter = new BufferWriter(this.header, this.size);
    }

    get bufferWriter() {
        return this.#bufferWriter;
    }

    pack() {
        throw new Error('this method must be overwritten');
    }

    static unpack() {
        throw new Error('this method must be overwritten');
    }
}
