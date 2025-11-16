import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketIn from '../PacketIn';
import InternalPingPacketValidator from './InternalPingPacketValidator';

export default class InternalPingPacket extends PacketIn {
    private time: number;

    constructor({ time }) {
        super({
            header: PacketHeaderEnum.INTERNAL_PING,
            name: 'InternalPing',
            size: 5,
            validator: InternalPingPacketValidator,
        });
        this.time = time;
    }

    getTime() {
        return this.time;
    }

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.time = this.bufferReader.readUInt32LE();
        this.validate();
        return this;
    }
}
