import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

export default class CharacterDetailsPacket extends PacketOut {
    #vid;
    #playerClass;
    #playerName;
    #posX;
    #posY;
    #posZ;
    #empireId;
    #skillGroup;

    constructor({ vid, playerClass, playerName, posX, posY, posZ, empireId, skillGroup } = {}) {
        super({
            header: PacketHeaderEnum.CHARACTER_DETAILS,
            name: 'CharacterDetailsPacket',
            size: 46,
        });
        this.#vid = vid;
        this.#playerClass = playerClass;
        this.#playerName = playerName;
        this.#posX = posX;
        this.#posY = posY;
        this.#posZ = posZ;
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

    get posX() {
        return this.#posX;
    }

    get posY() {
        return this.#posY;
    }

    get posZ() {
        return this.#posZ;
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
        this.bufferWriter.writeUint32LE(this.#posX);
        this.bufferWriter.writeUint32LE(this.#posY);
        this.bufferWriter.writeUint32LE(this.#posZ);
        this.bufferWriter.writeUint8(this.#empireId);
        this.bufferWriter.writeUint8(this.#skillGroup);

        return this.bufferWriter.buffer;
    }
}
