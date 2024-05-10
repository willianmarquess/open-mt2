import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketBidirectional from './PacketBidirectional.js';

export default class HandshakePacket extends PacketBidirectional {
    #id;
    #time;
    #delta;

    constructor({ id, time, delta } = {}) {
        super({
            header: PacketHeaderEnum.HANDSHAKE,
            name: 'HandshakePacket',
            size: 13,
        });
        this.#id = id;
        this.#time = time;
        this.#delta = delta;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.#id).writeUint32LE(this.#time).writeUint32LE(this.#delta);
        return this.bufferWriter.buffer;
    }

    unpack(buffer) {
        this.bufferReader.setBuffer(buffer);
        this.#id = this.bufferReader.readUInt32LE();
        this.#time = this.bufferReader.readUInt32LE();
        this.#delta = this.bufferReader.readUInt32LE();
        return this;
    }
}
