import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from './PacketOut';

const PACKET_SIZE = 4;

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
