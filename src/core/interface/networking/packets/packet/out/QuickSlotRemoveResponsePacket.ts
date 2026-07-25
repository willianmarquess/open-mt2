import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from './PacketOut';

export default class QuickSlotRemoveResponsePacket extends PacketOut {
    private slot: number;

    constructor({ slot }: { slot: number }) {
        super({
            header: PacketHeaderEnum.QUICK_SLOT_REMOVE_RESPONSE,
            name: 'QuickSlotRemoveResponsePacket',
            size: 2,
        });
        this.slot = slot;
    }

    getSlot() {
        return this.slot;
    }

    pack() {
        this.bufferWriter.writeUint8(this.slot);
        return this.bufferWriter.getBuffer();
    }
}
