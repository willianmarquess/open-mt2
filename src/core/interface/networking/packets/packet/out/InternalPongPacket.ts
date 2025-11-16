import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name InternalPongPacket
 * @header 253
 * @size 5
 * @description Used to internal pong.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {int} time 4 The time sent by client
 */

export default class InternalPongPacket extends PacketOut {
    private time: number;

    constructor({ time }) {
        super({
            header: PacketHeaderEnum.INTERNAL_PONG,
            name: 'SpecialEffectPacket',
            size: 5,
        });
        this.time = time;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.time);
        return this.bufferWriter.getBuffer();
    }
}
