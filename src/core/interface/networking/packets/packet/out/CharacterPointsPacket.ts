import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name CharacterPointsPacket
 * @header 0x10
 * @size 1021
 * @description Is used to send update of all the points (attributes) of a character to the client. See all points in PointsEnum.
 * @fields
 *   - {byte} header 1 Packet header.
 *   - {int[255]} points 4 In this array we send the value of each point.
 */

export default class CharacterPointsPacket extends PacketOut {
    points: Array<number> = new Array(255).fill(0);

    constructor() {
        super({
            header: PacketHeaderEnum.CHARACTER_POINTS,
            name: 'CharacterPointsPacket',
            size: 1021,
        });
    }

    addPoint(pos: number, value: number) {
        this.points[pos] = value;
    }

    pack() {
        for (let i = 0; i < 255; i++) {
            this.bufferWriter.writeUint32LE(this.points[i]);
        }
        return this.bufferWriter.getBuffer();
    }
}
