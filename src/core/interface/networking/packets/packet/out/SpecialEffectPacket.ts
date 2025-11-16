import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name SpecialEffectPacket
 * @header 0x72
 * @size 6
 * @description Used to send an special effect.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {byte} type 1 Describe the special effect. See in SpecialEffectTypeEnum
 *   - {int} virtual 4 Virtual id of the player to be effected
 */

export default class SpecialEffectPacket extends PacketOut {
    private type: number;
    private virtualId: number;

    constructor({ type, virtualId }) {
        super({
            header: PacketHeaderEnum.SPECIAL_EFFECT,
            name: 'SpecialEffectPacket',
            size: 6,
        });
        this.type = type;
        this.virtualId = virtualId;
    }

    pack() {
        this.bufferWriter.writeUint8(this.type);
        this.bufferWriter.writeUint32LE(this.virtualId);
        return this.bufferWriter.getBuffer();
    }
}
