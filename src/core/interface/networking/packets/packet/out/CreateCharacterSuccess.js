import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

function ipToInt(ip) {
    var parts = ip.split('.');
    var res = 0;

    res += parseInt(parts[0], 10) << 24;
    res += parseInt(parts[1], 10) << 16;
    res += parseInt(parts[2], 10) << 8;
    res += parseInt(parts[3], 10);

    return res;
}

const defaultCharacter = {
    id: 0,
    name: '',
    clazz: 0,
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
    ip: ipToInt('127.0.0.1'),
    port: 13001,
    skillGroup: 0,
};

export default class CreateCharacterSucessPacket extends PacketOut {
    #slot;
    #character;

    constructor({ slot, character = defaultCharacter } = {}) {
        super({
            header: PacketHeaderEnum.CREATE_CHARACTER_SUCCESS,
            name: 'CreateCharacterSucessPacket',
            size: 65,
        });
        this.#slot = slot;
        this.#character = character;
    }

    pack() {
        this.bufferWriter.writeUint8(this.#slot);
        this.bufferWriter.writeUint32LE(this.#character.id);
        this.bufferWriter.writeString(this.#character.name, 25);
        this.bufferWriter.writeUint8(this.#character.clazz);
        this.bufferWriter.writeUint8(this.#character.level);
        this.bufferWriter.writeUint32LE(this.#character.playtime);
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
