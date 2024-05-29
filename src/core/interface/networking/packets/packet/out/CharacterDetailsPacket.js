import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

export default class CharacterDetailsPacket extends PacketOut {
    #vid;
    #playerClass;
    #playerName;
    #positionX;
    #positionY;
    #positionZ;
    #empireId;
    #skillGroup;

    constructor({ vid, playerClass, playerName, positionX, positionY, positionZ, empireId, skillGroup } = {}) {
        super({
            header: PacketHeaderEnum.CHARACTER_DETAILS,
            name: 'CharacterDetailsPacket',
            size: 46,
        });
        this.#vid = vid;
        this.#playerClass = playerClass;
        this.#playerName = playerName;
        this.#positionX = positionX;
        this.#positionY = positionY;
        this.#positionZ = positionZ;
        this.#empireId = empireId;
        this.#skillGroup = skillGroup;
    }

    get vid() {
        return this.#vid;
    }

    get playerClass() {
        return this.#playerClass;
    }

    get playerName() {
        return this.#playerName;
    }

    get positionX() {
        return this.#positionX;
    }

    get positionY() {
        return this.#positionY;
    }

    get positionZ() {
        return this.#positionZ;
    }

    get empireId() {
        return this.#empireId;
    }

    get skillGroup() {
        return this.#skillGroup;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.#vid);
        this.bufferWriter.writeUint16LE(this.#playerClass);
        this.bufferWriter.writeString(this.#playerName, 25);
        this.bufferWriter.writeUint32LE(this.#positionX);
        this.bufferWriter.writeUint32LE(this.#positionY);
        this.bufferWriter.writeUint32LE(this.#positionZ);
        this.bufferWriter.writeUint8(this.#empireId);
        this.bufferWriter.writeUint8(this.#skillGroup);

        return this.bufferWriter.buffer;
    }
}
