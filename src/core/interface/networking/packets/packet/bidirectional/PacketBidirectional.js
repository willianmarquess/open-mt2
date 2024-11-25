import BufferReader from '../../../buffer/BufferReader.js';
import BufferWriter from '../../../buffer/BufferWriter.js';
import Packet from '../Packet.js';

export default class PacketBidirectional extends Packet {
    private bufferWriter;
    private bufferReader;

    constructor({ header, subHeader, size, name, validator }) {
        super({ header, subHeader, size, name, validator });
        this.bufferWriter = new BufferWriter(this.header, this.size);
        this.bufferReader = new BufferReader();
    }

    get bufferWriter() {
        return this.bufferWriter;
    }

    get bufferReader() {
        return this.bufferReader;
    }

    pack() {
        throw new Error('this method must be overwritten');
    }

    unpack() {
        throw new Error('this method must be overwritten');
    }
}
