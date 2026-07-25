import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketIn from '../PacketIn';
import QuickSlotRemoveRequestPacketValidator from './QuickSlotRemoveRequestPacketValidator';

export default class QuickSlotRemoveRequestPacket extends PacketIn {
    private slot: number;

    constructor({ slot }: { slot: number }) {
        super({
            header: PacketHeaderEnum.QUICK_SLOT_REMOVE_REQUEST,
            name: 'QuickSlotRemoveRequestPacket',
            size: 4,
            validator: QuickSlotRemoveRequestPacketValidator,
        });
        this.slot = slot;
    }

    getSlot() {
        return this.slot;
    }

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.slot = this.bufferReader.readUInt8();
        this.validate();
        return this;
    }
}
