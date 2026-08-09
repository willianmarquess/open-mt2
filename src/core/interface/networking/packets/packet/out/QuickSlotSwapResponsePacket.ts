import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from './PacketOut';

/**
 * @packet
 * @type Out
 * @name QuickSlotSwapResponsePacket
 * @header 0x1e
 * @size 3
 * @description Used to confirm to the client that the content of two quick slots was swapped.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {byte} slotA 1 First quick slot position of the swap
 *   - {byte} slotB 1 Second quick slot position of the swap
 */

export default class QuickSlotSwapResponsePacket extends PacketOut {
    private readonly slotA: number;
    private readonly slotB: number;

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
