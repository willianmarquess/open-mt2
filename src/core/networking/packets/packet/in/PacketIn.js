import BufferReader from '../../../buffer/BufferReader.js';
import Packet from '../Packet.js';

export default class PacketIn extends Packet {
    #bufferReader = new BufferReader();

    get bufferReader() {
        return this.#bufferReader;
    }

    unpack() {
        throw new Error('this method must be overwritten');
    }
}
