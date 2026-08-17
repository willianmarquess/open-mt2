import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name AffectRemovePacket
 * @header 0x7F
 * @size 6
 * @description Used to remove a previously sent affect (hides its icon on the client).
 * @fields
 *   - {byte} header 1 Packet header
 *   - {int} type 4 Apply type number, must match the type used when the affect was added. See in AffectTypeEnum
 *   - {byte} apply 1 Describe which point the affect was on. See in PointEnum
 */

export default class AffectRemovePacket extends PacketOut {
    private readonly type: number;
    private readonly apply: number;

    constructor({ type, apply }: { type: number; apply: number }) {
        super({
            header: PacketHeaderEnum.AFFECT_REMOVE,
            name: 'AffectRemovePacket',
            size: 6,
        });
        this.type = type;
        this.apply = apply;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.type);
        this.bufferWriter.writeUint8(this.apply);
        return this.bufferWriter.getBuffer();
    }
}
