import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * GC_CHARACTER_DELETE_WRONG_SOCIAL_ID (header 11) — header-only packet; the
 * client shows the "wrong private code" message.
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
