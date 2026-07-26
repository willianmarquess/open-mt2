import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketIn from '../PacketIn';
import DeleteCharacterPacketValidator from './DeleteCharacterPacketValidator';

/**
 * CG_CHARACTER_DELETE (header 5) — sent from the character select screen.
 * Payload: slot index (1 byte) + private code typed by the user (8 bytes,
 * 7 chars + NUL), which must match the account's delete code.
 */
export default class DeleteCharacterPacket extends PacketIn {
    private slot: number;
    private privateCode: string;

    constructor({ slot, privateCode }: { slot?: number; privateCode?: string } = {}) {
        super({
            header: PacketHeaderEnum.DELETE_CHARACTER,
            name: 'DeleteCharacterPacket',
            size: 10,
            validator: DeleteCharacterPacketValidator,
        });
        this.slot = slot ?? 0;
        this.privateCode = privateCode ?? '';
    }

    getSlot() {
        return this.slot;
    }

    getPrivateCode() {
        return this.privateCode;
    }

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.slot = this.bufferReader.readUInt8();
        // private_code[8] is not NUL-terminated by the client: it holds the 7
        // typed chars plus a garbage byte. The original server only compares the
        // first 7 chars (strncmp(..., 7)), so truncate accordingly.
        this.privateCode = this.bufferReader.readString(8).substring(0, 7);
        this.validate();
        return this;
    }
}
