import PacketHeader from '../../enum/PacketHeader.js';
import BufferUtil from '../../util/BufferUtil.js';
import Packet from './Packet.js';

export default class HandshakePacket extends Packet {
    #id;
    #time;
    #delta;

    constructor({ id, time, delta } = {}) {
        super({
            header: PacketHeader.HANDSHAKE,
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
