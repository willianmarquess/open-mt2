import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import { QuickSlotTypeEnum } from '@/core/enum/QuickSlotTypeEnum';
import PacketOut from './PacketOut';

/**
 * @packet
 * @type Out
 * @name QuickSlotAddResponsePacket
 * @header 0x1c
 * @size 4
 * @description Used to confirm to the client that a quick slot was filled.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {byte} slot 1 Quick slot position that was filled
 *   - {byte} type 1 Kind of entry placed in the slot. See QuickSlotTypeEnum.
 *   - {byte} position 1 Position of the item or skill inside its own container
 */

export default class QuickSlotAddResponsePacket extends PacketOut {
    private readonly slot: number;
    private readonly type: QuickSlotTypeEnum;
    private readonly position: number;

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
