import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name AffectAddPacket
 * @header 0x7E
 * @size 22
 * @description Used to send an effect.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {int} type 4 Apply type number. See in AffectTypeEnum
 *   - {byte} apply 1 Describe which point is affected by this affect. See in PointEnum
 *   - {int} flag 4 The bit flag of applies. See in AffectBitsTypeEnum
 *   - {int} duration 4 The duration in seconds of an affect
 *   - {int} manaCost 4 The mana cost of an affect
 */

export default class AffectAddPacket extends PacketOut {
    private type: number;
    private apply: number;
    private value: number;
    private flag: number;
    private duration: number;
    private manaCost: number;

    constructor({ type, apply, value, flag, duration, manaCost = 0 }) {
        super({
            header: PacketHeaderEnum.AFFECT_ADD,
            name: 'AffectAddPacket',
            size: 22,
        });
        this.type = type;
        this.apply = apply;
        this.value = value;
        this.flag = flag;
        this.duration = duration;
        this.manaCost = manaCost;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.type);
        this.bufferWriter.writeUint8(this.apply);
        this.bufferWriter.writeUint32LE(this.value);
        this.bufferWriter.writeUint32LE(this.flag);
        this.bufferWriter.writeUint32LE(this.duration);
        this.bufferWriter.writeUint32LE(this.manaCost);
        return this.bufferWriter.getBuffer();
    }
}
