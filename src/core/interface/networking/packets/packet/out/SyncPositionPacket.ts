import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name SyncPositionPacket
 * @header 0x05
 * @size 15
 * @description Forces the client to snap an entity (including the player's own
 * character) to a server-side position. Mirrors TPacketGCSyncPosition from the
 * original protocol: header, wSize, then one {vid, x, y} element.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {number} size 2 Total packet size in bytes
 *   - {number} virtualId 4 virtualId of the entity to snap
 *   - {number} positionX 4 Server-side X position
 *   - {number} positionY 4 Server-side Y position
 */

const PACKET_SIZE = 1 + 2 + 12; // header + wSize + one sync element

export default class SyncPositionPacket extends PacketOut {
    private readonly virtualId: number;
    private readonly positionX: number;
    private readonly positionY: number;

    constructor({ virtualId, positionX, positionY }: { virtualId: number; positionX: number; positionY: number }) {
        super({
            header: PacketHeaderEnum.SYNC_POSITION,
            name: 'SyncPositionPacket',
            size: PACKET_SIZE,
        });
        this.virtualId = virtualId;
        this.positionX = positionX;
        this.positionY = positionY;
    }

    pack() {
        this.bufferWriter.writeUint16LE(PACKET_SIZE);
        this.bufferWriter.writeUint32LE(this.virtualId);
        this.bufferWriter.writeUint32LE(this.positionX);
        this.bufferWriter.writeUint32LE(this.positionY);
        return this.bufferWriter.getBuffer();
    }
}
