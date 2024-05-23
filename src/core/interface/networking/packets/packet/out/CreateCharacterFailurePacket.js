import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

export default class CreateCharacterFailurePacket extends PacketOut {
    #reason;

    constructor({ reason } = {}) {
        super({
            header: PacketHeaderEnum.CREATE_CHARACTER_FAILURE,
            name: 'CreateCharacterFailurePacket',
            size: 2,
        });
        this.#reason = reason;
    }

    pack() {
        this.bufferWriter.writeUint8(this.#reason);

        return this.bufferWriter.buffer;
    }
}
