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
            length: 13,
        });
        this.#id = id;
        this.#time = time;
        this.#delta = delta;
    }

    pack() {
        const headerBuffer = Buffer.from([this.header]);
        const idBuffer = BufferUtil.numberToBuffer(this.#id);
        const timeBuffer = BufferUtil.numberToBuffer(this.#time);
        const deltaBuffer = BufferUtil.numberToBuffer(this.#delta);

        return Buffer.concat([headerBuffer, idBuffer, timeBuffer, deltaBuffer]);
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
