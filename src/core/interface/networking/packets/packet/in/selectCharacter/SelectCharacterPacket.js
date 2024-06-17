import PacketHeaderEnum from '../../../../../../enum/PacketHeaderEnum.js';
import PacketIn from '../PacketIn.js';

export default class SelectCharacterPacket extends PacketIn {
    #slot;

    constructor({ slot } = {}) {
        super({
            header: PacketHeaderEnum.SELECT_CHARACTER,
            name: 'SelectCharacterPacket',
            size: 2,
        });
        this.#slot = slot;
    }

    get slot() {
        return this.#slot;
    }

    unpack(buffer) {
        this.bufferReader.setBuffer(buffer);
        this.#slot = this.bufferReader.readUInt8();
        this.validate();
        return this;
    }
}
