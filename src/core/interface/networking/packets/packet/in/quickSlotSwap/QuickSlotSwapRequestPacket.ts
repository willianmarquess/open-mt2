import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketIn from '../PacketIn';
import QuickSlotSwapRequestPacketValidator from './QuickSlotSwapRequestPacketValidator';

export default class QuickSlotSwapRequestPacket extends PacketIn {
    private slotA: number;
    private slotB: number;

    constructor({ slotA, slotB }: { slotA: number; slotB: number }) {
        super({
            header: PacketHeaderEnum.QUICK_SLOT_SWAP_REQUEST,
            name: 'QuickSlotSwapRequestPacket',
            size: 3,
            validator: QuickSlotSwapRequestPacketValidator,
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

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.slotA = this.bufferReader.readUInt8();
        this.slotB = this.bufferReader.readUInt8();
        this.validate();
        return this;
    }
}
