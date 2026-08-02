import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name TeleportPacket
 * @header 0x41
 * @size 15
 * @description Is used to warp the player to another position, reconnecting it to the game server that owns the destination.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {int} positionX 4 Destination position X in game
 *   - {int} positionY 4 Destination position Y in game
 *   - {int} address 4 Address of the destination game server
 *   - {short} port 2 Port of the destination game server
 */

export default class TeleportPacket extends PacketOut {
    private readonly positionX: number;
    private readonly positionY: number;
    private readonly address: number;
    private readonly port: number;

    constructor({
        positionX,
        positionY,
        address,
        port,
    }: {
        positionX: number;
        positionY: number;
        address: number;
        port: number;
    }) {
        super({
            header: PacketHeaderEnum.TELEPORT,
            name: 'TeleportPacket',
            size: 15,
        });
        this.positionX = positionX;
        this.positionY = positionY;
        this.address = address;
        this.port = port;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.positionX);
        this.bufferWriter.writeUint32LE(this.positionY);
        this.bufferWriter.writeUint32LE(this.address);
        this.bufferWriter.writeUint16LE(this.port);
        return this.bufferWriter.getBuffer();
    }
}
