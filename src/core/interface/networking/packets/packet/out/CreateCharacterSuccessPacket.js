import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

const defaultCharacter = {
    id: 0,
    name: '',
    playerClass: 0,
    level: 1,
    playTime: 1,
    st: 0,
    ht: 0,
    dx: 0,
    iq: 0,
    bodyPart: 0,
    nameChange: 0,
    hairPart: 0,
    positionX: 0,
    positionY: 0,
    ip: 0,
    port: 13001,
    skillGroup: 0,
};

export default class CreateCharacterSuccessPacket extends PacketOut {
    #slot;
    #character;

    constructor({ slot, character = defaultCharacter } = {}) {
        super({
            header: PacketHeaderEnum.CREATE_CHARACTER_SUCCESS,
            name: 'CreateCharacterSuccessPacket',
            size: 65,
        });
        this.#slot = slot;
        this.#character = character;
    }

    pack() {
        this.bufferWriter.writeUint8(this.#slot);
        this.bufferWriter.writeUint32LE(this.#character.id);
        this.bufferWriter.writeString(this.#character.name, 25);
        this.bufferWriter.writeUint8(this.#character.playerClass);
        this.bufferWriter.writeUint8(this.#character.level);
        this.bufferWriter.writeUint32LE(this.#character.playTime);
        this.bufferWriter.writeUint8(this.#character.st);
        this.bufferWriter.writeUint8(this.#character.ht);
        this.bufferWriter.writeUint8(this.#character.dx);
        this.bufferWriter.writeUint8(this.#character.iq);
        this.bufferWriter.writeUint16LE(this.#character.bodyPart);
        this.bufferWriter.writeUint8(this.#character.nameChange);
        this.bufferWriter.writeUint16LE(this.#character.hairPart);
        this.bufferWriter.writeUint32LE(0);
        this.bufferWriter.writeUint32LE(this.#character.positionX);
        this.bufferWriter.writeUint32LE(this.#character.positionY);
        this.bufferWriter.writeUint32LE(this.#character.ip);
        this.bufferWriter.writeUint16LE(this.#character.port);
        this.bufferWriter.writeUint8(this.#character.skillGroup);

        return this.bufferWriter.buffer;
    }
}
