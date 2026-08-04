import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from './PacketOut';

const PACKET_SIZE = 4;

/**
 * @packet
 * @type Out
 * @name ItemUsePacket
 * @header 0x0b
 * @size 4
 * @description Sends the use of an item at a given window cell.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {byte} window 1 Window the cell belongs to (See WindowTypeEnum)
 *   - {short} position 2 Cell position inside the window
 */

export default class ItemUsePacket extends PacketOut {
    private readonly window: number;
    private readonly position: number;

    constructor({ window, position }: { window: number; position: number }) {
        super({ header: PacketHeaderEnum.ITEM_USE, size: PACKET_SIZE, name: 'ItemUsePacket' });
        this.window = window;
        this.position = position;
    }

    pack(): Buffer {
        this.bufferWriter.writeUint8(this.window);
        this.bufferWriter.writeUint16LE(this.position);
        return this.bufferWriter.getBuffer();
    }
}
