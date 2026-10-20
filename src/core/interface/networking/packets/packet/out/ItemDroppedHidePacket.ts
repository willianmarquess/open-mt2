import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name ItemDroppedHidePacket
 * @header 0x1b
 * @size 5
 * @description Tells the client to remove a dropped item from the ground. Matches the 5-byte TPacketGCItemGroundDel client struct.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {int} virtualId 4 Virtual id of the ground item to remove
 */

export default class ItemDroppedHidePacket extends PacketOut {
    private readonly virtualId: number;

    constructor({ virtualId }: { virtualId: number }) {
        super({
            header: PacketHeaderEnum.ITEM_DROPPED_HIDE,
            name: 'ItemDroppedHidePacket',
            size: 5,
        });
        this.virtualId = virtualId;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.virtualId);
        return this.bufferWriter.getBuffer();
    }
}
