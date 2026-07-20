import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketIn from '../PacketIn';
import QuickSlotAddRequestPacketValidator from './QuickSlotAddRequestPacketValidator';
import { QuickSlotTypeEnum } from '@/core/enum/QuickSlotTypeEnum';

export default class QuickSlotAddRequestPacket extends PacketIn {
    private slot: number;
    private type: QuickSlotTypeEnum;
    private position: number;

    constructor({ slot, type, position }: { slot: number; type: QuickSlotTypeEnum; position: number }) {
        super({
            header: PacketHeaderEnum.QUICK_SLOT_ADD_REQUEST,
            name: 'QuickSlotAddRequestPacket',
            size: 4,
            validator: QuickSlotAddRequestPacketValidator,
        });
        this.slot = slot;
        this.type = type;
        this.position = position;
    }

    getSlot() {
        return this.slot;
    }

    getType() {
        return this.type;
    }

    getPosition() {
        return this.position;
    }

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.slot = this.bufferReader.readUInt8();
        this.type = this.bufferReader.readUInt8();
        this.position = this.bufferReader.readUInt8();
        this.validate();
        return this;
    }
}
