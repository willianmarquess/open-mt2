import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from './PacketOut';

export default class QuickSlotSwapResponsePacket extends PacketOut {
    private slotA: number;
    private slotB: number;

    constructor({ slotA, slotB }: { slotA: number; slotB: number }) {
        super({
            header: PacketHeaderEnum.QUICK_SLOT_SWAP_RESPONSE,
            name: 'QuickSlotSwapResponsePacket',
            size: 3,
        });
        this.slotA = slotA;
        this.slotB = slotB;
    }

    getSlotA() {
        return this.slotA;
    }

    getSlotB() {
        return this.slotB;
    }

    pack() {
        this.bufferWriter.writeUint8(this.slotA);
        this.bufferWriter.writeUint8(this.slotB);
        return this.bufferWriter.getBuffer();
    }
}
