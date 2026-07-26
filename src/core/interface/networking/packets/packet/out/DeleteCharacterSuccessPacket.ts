import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * GC_CHARACTER_DELETE_SUCCESS (header 10) — tells the client the character
 * in the given slot was deleted so it can clear the slot on screen.
 */
export default class DeleteCharacterSuccessPacket extends PacketOut {
    private slot: number;

    constructor({ slot }: { slot: number }) {
        super({
            header: PacketHeaderEnum.DELETE_CHARACTER_SUCCESS,
            name: 'DeleteCharacterSuccessPacket',
            size: 2,
        });
        this.slot = slot;
    }

    pack() {
        this.bufferWriter.writeUint8(this.slot);

        return this.bufferWriter.getBuffer();
    }
}
