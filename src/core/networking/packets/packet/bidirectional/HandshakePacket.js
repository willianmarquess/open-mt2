import PacketHeaderEnum from '../../../../enum/PacketHeaderEnum.js';
import BufferUtil from '../../../../util/BufferUtil.js';
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

    static unpack(buffer) {
        const id = BufferUtil.bufferToNumber(buffer, 1);
        const time = BufferUtil.bufferToNumber(buffer, 5);
        const delta = BufferUtil.bufferToNumber(buffer, 9);
        return new HandshakePacket({
            id,
            delta,
            time,
        });
    }
}
