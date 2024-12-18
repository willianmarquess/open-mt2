import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

type CharacterPointChangePacketParams = {
    vid?: number;
    type?: number;
    amount?: number;
    value?: number;
};

/**
 * @packet
 * @type Out
 * @name CharacterPointChangePacket
 * @header 0x11
 * @size 22
 * @description Is used to send and update of a point (attribute) to the client (used to notify all nearby players of an update of a character). See all points in PointsEnum.
 * @fields
 *   - {byte} header 1 Packet header.
 *   - {int} vid 4 Character identification in game.
 *   - {byte} type 1 Number which indicates the point type (See in PointsEnum).
 *   - {long} amount 8 Number which indicates the quantity of that point (default is 0).
 *   - {long} value 8 Number which indicates the value of that point.
 */

export default class CharacterPointChangePacket extends PacketOut {
    private vid: number;
    private type: number;
    private amount: number;
    private value: number;

    constructor({ vid, type, amount, value }: CharacterPointChangePacketParams = {}) {
        super({
            header: PacketHeaderEnum.CHARACTER_POINT_CHANGE,
            name: 'CharacterPointChangePacket',
            size: 22,
        });
        this.vid = vid;
        this.type = type;
        this.amount = amount;
        this.value = value;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.vid);
        this.bufferWriter.writeUint8(this.type);
        this.bufferWriter.writeUint64LE(this.amount);
        this.bufferWriter.writeUint64LE(this.value);
        return this.bufferWriter.getBuffer();
    }
}
