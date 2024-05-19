import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketIn from './PacketIn.js';

export default class CreateCharacterPacket extends PacketIn {
    #slot;
    #playerName;
    #clazz;
    #appearance;

    constructor({ slot, playerName, clazz, appearance } = {}) {
        super({
            header: PacketHeaderEnum.CREATE_CHARACTER,
            name: 'CreateCharacterPacket',
            size: 29,
        });
        this.#slot = slot;
        this.#playerName = playerName;
        this.#clazz = clazz;
        this.#appearance = appearance;
    }

    get slot() {
        return this.#slot;
    }

    get playerName() {
        return this.#playerName;
    }

    get clazz() {
        return this.#clazz;
    }

    get appearance() {
        return this.#appearance;
    }

    unpack(buffer) {
        this.bufferReader.setBuffer(buffer);
        this.#slot = this.bufferReader.readUInt8();
        this.#playerName = this.bufferReader.readString(25);
        this.#clazz = this.bufferReader.readUInt16LE();
        this.#appearance = this.bufferReader.readUInt8();
        return this;
    }
}
