import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

export default class ItemDroppedPacket extends PacketOut {
    private readonly positionX: number;
    private readonly positionY: number;
    private readonly positionZ: number = 0;
    private readonly virtualId: number;
    private readonly id: number;

    constructor({
        id,
        positionX,
        positionY,
        virtualId,
    }: {
        id: number;
        positionX: number;
        positionY: number;
        virtualId: number;
    }) {
        super({
            header: PacketHeaderEnum.ITEM_DROPPED,
            name: 'ItemDroppedPacket',
            size: 21,
        });
        this.id = id;
        this.positionX = positionX;
        this.positionY = positionY;
        this.virtualId = virtualId;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.positionX);
        this.bufferWriter.writeUint32LE(this.positionY);
        this.bufferWriter.writeUint32LE(this.positionZ);
        this.bufferWriter.writeUint32LE(this.virtualId);
        this.bufferWriter.writeUint32LE(this.id);
        return this.bufferWriter.getBuffer();
    }
}
