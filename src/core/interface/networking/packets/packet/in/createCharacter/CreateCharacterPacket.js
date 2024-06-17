import PacketHeaderEnum from '../../../../../../enum/PacketHeaderEnum.js';
import PacketIn from '../PacketIn.js';
import CreateCharacterPacketValidator from './CreateCharacterPacketValidator.js';

export default class CreateCharacterPacket extends PacketIn {
    #slot;
    #playerName;
    #playerClass;
    #appearance;

    constructor({ slot, playerName, playerClass, appearance } = {}) {
        super({
            header: PacketHeaderEnum.CREATE_CHARACTER,
            name: 'CreateCharacterPacket',
            size: 29,
            validator: CreateCharacterPacketValidator,
        });
        this.#slot = slot;
        this.#playerName = playerName;
        this.#playerClass = playerClass;
        this.#appearance = appearance;
    }

    get slot() {
        return this.#slot;
    }

    get playerName() {
        return this.#playerName;
    }

    get playerClass() {
        return this.#playerClass;
    }

    get appearance() {
        return this.#appearance;
    }

    unpack(buffer) {
        this.bufferReader.setBuffer(buffer);
        this.#slot = this.bufferReader.readUInt8();
        this.#playerName = this.bufferReader.readString(25);
        this.#playerClass = this.bufferReader.readUInt16LE();
        this.#appearance = this.bufferReader.readUInt8();
        this.validate();
        return this;
    }
}
