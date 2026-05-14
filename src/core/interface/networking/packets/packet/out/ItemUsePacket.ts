import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from './PacketOut';

// GC_ITEM_USE wire layout:
//  [1B header=0x0b][1B window][2B position]  — 4 bytes total
const PACKET_SIZE = 4;

export default class ItemUsePacket extends PacketOut {
    private window: number;
    private position: number;

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
