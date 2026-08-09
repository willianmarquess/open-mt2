import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name CreateCharacterFailurePacket
 * @header 0x09
 * @size 2
 * @description Sent when the character creation request is refused, the client shows the matching error message on the select screen.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {byte} reason 1 Number which indicates why the creation failed (See CreateCharacterFailureReasonEnum).
 */

export default class CreateCharacterFailurePacket extends PacketOut {
    private readonly reason: number;

    constructor({ reason }: { reason: number }) {
        super({
            header: PacketHeaderEnum.CREATE_CHARACTER_FAILURE,
            name: 'CreateCharacterFailurePacket',
            size: 2,
        });
        this.reason = reason;
    }

    pack() {
        this.bufferWriter.writeUint8(this.reason);

        return this.bufferWriter.getBuffer();
    }
}
