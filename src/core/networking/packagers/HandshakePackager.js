import BufferUtil from '../../util/BufferUtil.js';
import HandshakePacket from '../packets/HandshakePacket.js';
import Packager from './Packager.js';

export default class HandshakePackager extends Packager {
    constructor() {
        super({
            header: 0xff,
            name: 'HandshakePacket',
            length: 13,
        });
    }

    pack(packet) {
        const headerBuffer = Buffer.from([this.header]);
        const idBuffer = BufferUtil.numberToBuffer(packet.id);
        const timeBuffer = BufferUtil.numberToBuffer(packet.time);
        const deltaBuffer = BufferUtil.numberToBuffer(packet.delta);

        return Buffer.concat([headerBuffer, idBuffer, timeBuffer, deltaBuffer]);
    }

    unpack(buffer) {
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
