import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

export default class CharacterSpawnPacket extends PacketOut {
    #vid;
    #rotation = 0;
    #positionX;
    #positionY;
    #positionZ;
    #entityType;
    #playerClass;
    #movementSpeed;
    #attackSpeed;
    #state = 0;
    #affects = new Array(2).fill(0);

    constructor({
        vid,
        rotation,
        positionX,
        positionY,
        positionZ,
        entityType,
        playerClass,
        movementSpeed,
        attackSpeed,
        state,
        affects,
    } = {}) {
        super({
            header: PacketHeaderEnum.CHARACTER_SPAWN,
            name: 'CharacterSpawnPacket',
            size: 35,
        });
        this.#vid = vid;
        this.#rotation = rotation ?? this.#rotation;
        this.#positionX = positionX;
        this.#positionY = positionY;
        this.#positionZ = positionZ;
        this.#entityType = entityType;
        this.#playerClass = playerClass;
        this.#movementSpeed = movementSpeed;
        this.#attackSpeed = attackSpeed;
        this.#state = state ?? this.#state;
        this.#affects = affects ?? this.#affects;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.#vid);
        this.bufferWriter.writeFloatLE(this.#rotation);
        this.bufferWriter.writeUint32LE(this.#positionX);
        this.bufferWriter.writeUint32LE(this.#positionY);
        this.bufferWriter.writeUint32LE(this.#positionZ);
        this.bufferWriter.writeUint8(this.#entityType);
        this.bufferWriter.writeUint16LE(this.#playerClass);
        this.bufferWriter.writeUint8(this.#movementSpeed);
        this.bufferWriter.writeUint8(this.#attackSpeed);
        this.bufferWriter.writeUint8(this.#state);
        this.#affects.forEach((affect) => this.bufferWriter.writeUint32LE(affect));

        return this.bufferWriter.buffer;
    }
}
