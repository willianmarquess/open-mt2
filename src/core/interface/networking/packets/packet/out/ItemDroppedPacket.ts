import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name ItemDroppedPacket
 * @header 0x1a
 * @size 21
 * @description Tells the client to spawn a dropped item on the ground at the given position.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {int} positionX 4 Position X of the item on the ground
 *   - {int} positionY 4 Position Y of the item on the ground
 *   - {int} positionZ 4 Position Z of the item on the ground, always 0
 *   - {int} virtualId 4 Virtual id assigned to the ground item
 *   - {int} id 4 Item vnum (prototype id) used to render the item
 */

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
