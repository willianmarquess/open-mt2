import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name ItemDroppedHidePacket
 * @header 0x1b
 * @size 21
 * @description Tells the client to remove a dropped item from the ground. Only the 5 bytes listed below are written by pack(); the declared size of 21 makes the buffer 16 bytes longer than the payload, and those trailing bytes are sent as zeros. The client reads 5 bytes (TPacketGCItemGroundDel).
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
            size: 21,
        });
        this.virtualId = virtualId;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.virtualId);
        return this.bufferWriter.getBuffer();
    }
}
