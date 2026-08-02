import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name DeleteCharacterSuccessPacket
 * @header 0x0a
 * @size 2
 * @description Tells the client the character in the given slot was deleted so it can clear the slot on the select screen.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {byte} slot 1 Account character slot that was cleared (0 to 3).
 */

export default class DeleteCharacterSuccessPacket extends PacketOut {
    private readonly slot: number;

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
