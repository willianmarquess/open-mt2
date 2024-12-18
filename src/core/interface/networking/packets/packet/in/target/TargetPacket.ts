import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketIn from '../PacketIn';
import TargetPacketValidator from './TargetPacketValidator';

export default class TargetPacket extends PacketIn {
    private targetVirtualId: number;

    constructor({ targetVirtualId }) {
        super({
            header: PacketHeaderEnum.TARGET,
            name: 'TargetPacket',
            size: 5,
            validator: TargetPacketValidator,
        });
        this.targetVirtualId = targetVirtualId;
    }

    getTargetVirtualId() {
        return this.targetVirtualId;
    }

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.targetVirtualId = this.bufferReader.readUInt32LE();
        this.validate();
        return this;
    }
}
