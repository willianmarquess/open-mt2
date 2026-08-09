import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from './PacketOut';

/**
 * @packet
 * @type Out
 * @name QuickSlotRemoveResponsePacket
 * @header 0x1d
 * @size 2
 * @description Used to confirm to the client that a quick slot was cleared.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {byte} slot 1 Quick slot position that was cleared
 */

export default class QuickSlotRemoveResponsePacket extends PacketOut {
    private readonly slot: number;

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
