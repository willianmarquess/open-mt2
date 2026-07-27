import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name CharacterPointChangePacket
 * @header 0x11
 * @size 17
 * @description Is used to send an update of a single point (attribute) of a character to the client. The client plays the level-up effect when it receives a POINT_LEVEL change for any vid. See all points in PointsEnum.
 * @fields
 *   - {byte} header 1 Packet header.
 *   - {byte[3]} padding 3 The client declares the header as a 4-byte int, so 3 padding bytes follow the header byte.
 *   - {int} vid 4 Character identification in game.
 *   - {byte} type 1 Number which indicates the point type (See in PointsEnum).
 *   - {int} amount 4 Signed quantity delta of that point (default is 0).
 *   - {int} value 4 Signed new value of that point.
 */

export default class CharacterPointChangePacket extends PacketOut {
    private readonly vid: number;
    private readonly type: number;
    private readonly amount: number;
    private readonly value: number;

    constructor({ vid, type, amount, value }: { vid: number; type: number; amount: number; value: number }) {
        super({
            header: PacketHeaderEnum.CHARACTER_POINT_CHANGE,
            name: 'CharacterPointChangePacket',
            size: 17,
        });
        this.vid = vid;
        this.type = type;
        this.amount = amount;
        this.value = value;
    }

    pack() {
        // The client struct starts with `int header` inside its pack(1) region,
        // so the header byte is followed by 3 padding bytes before the payload.
        this.bufferWriter.writeUint8(0);
        this.bufferWriter.writeUint8(0);
        this.bufferWriter.writeUint8(0);
        this.bufferWriter.writeUint32LE(this.vid);
        this.bufferWriter.writeUint8(this.type);
        this.bufferWriter.writeInt32LE(this.amount);
        this.bufferWriter.writeInt32LE(this.value);
        return this.bufferWriter.getBuffer();
    }
}
