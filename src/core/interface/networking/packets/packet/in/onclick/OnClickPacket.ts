import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketIn from '../PacketIn';
import OnClickPacketValidator from './OnClickPacketValidator';

export default class OnClickPacket extends PacketIn {
    private targetVirtualId: number;

    constructor({ targetVirtualId }: { targetVirtualId: number }) {
        super({
            header: PacketHeaderEnum.ON_CLICK,
            name: 'OnClickPacket',
            size: 5,
            validator: OnClickPacketValidator,
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
