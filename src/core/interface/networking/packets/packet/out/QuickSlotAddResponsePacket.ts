import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import { QuickSlotTypeEnum } from '@/core/enum/QuickSlotTypeEnum';
import PacketOut from './PacketOut';

export default class QuickSlotAddResponsePacket extends PacketOut {
    private slot: number;
    private type: QuickSlotTypeEnum;
    private position: number;

    constructor({ slot, type, position }: { slot: number; type: QuickSlotTypeEnum; position: number }) {
        super({
            header: PacketHeaderEnum.QUICK_SLOT_ADD_RESPONSE,
            name: 'QuickSlotAddResponsePacket',
            size: 4,
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

    pack() {
        this.bufferWriter.writeUint8(this.slot);
        this.bufferWriter.writeUint8(this.type);
        this.bufferWriter.writeUint8(this.position);
        return this.bufferWriter.getBuffer();
    }
}
