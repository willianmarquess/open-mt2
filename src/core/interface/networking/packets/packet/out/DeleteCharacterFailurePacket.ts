import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name DeleteCharacterFailurePacket
 * @header 0x0b
 * @size 1
 * @description Sent when the character deletion is refused, header only packet (GC_PLAYER_DELETE_WRONG_SOCIAL_ID), the client shows the wrong private code message.
 * @fields
 *   - {byte} header 1 Packet header
 */

export default class DeleteCharacterFailurePacket extends PacketOut {
    constructor() {
        super({
            header: PacketHeaderEnum.DELETE_CHARACTER_FAILURE,
            name: 'DeleteCharacterFailurePacket',
            size: 1,
        });
    }

    pack() {
        return this.bufferWriter.getBuffer();
    }
}
