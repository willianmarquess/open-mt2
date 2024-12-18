import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

type ItemDroppedPacketParams = {
    positionX?: number;
    positionY?: number;
    positionZ?: number;
    virtualId?: number;
    id?: number;
};

export default class ItemDroppedPacket extends PacketOut {
    private positionX: number;
    private positionY: number;
    private positionZ: number = 0;
    private virtualId: number;
    private id: number;

    constructor({ id, positionX, positionY, virtualId }: ItemDroppedPacketParams = {}) {
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
