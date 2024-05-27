import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

export default class CharacterSpawnPacket extends PacketOut {
    #vid;
    #angle = 0;
    #posX;
    #posY;
    #posZ;
    #entityType;
    #playerClass;
    #moveSpeed;
    #attackSpeed;
    #state = 0;
    #affects = new Array(2).fill(0);

    constructor({
        vid,
        angle,
        posX,
        posY,
        posZ,
        entityType,
        playerClass,
        moveSpeed,
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
        this.#angle = angle ?? this.#angle;
        this.#posX = posX;
        this.#posY = posY;
        this.#posZ = posZ;
        this.#entityType = entityType;
        this.#playerClass = playerClass;
        this.#moveSpeed = moveSpeed;
        this.#attackSpeed = attackSpeed;
        this.#state = state ?? this.#state;
        this.#affects = affects ?? this.#affects;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.#vid);
        this.bufferWriter.writeUint32LE(this.#angle);
        this.bufferWriter.writeUint32LE(this.#posX);
        this.bufferWriter.writeUint32LE(this.#posY);
        this.bufferWriter.writeUint32LE(this.#posZ);
        this.bufferWriter.writeUint8(this.#entityType);
        this.bufferWriter.writeUint16LE(this.#playerClass);
        this.bufferWriter.writeUint8(this.#moveSpeed);
        this.bufferWriter.writeUint8(this.#attackSpeed);
        this.bufferWriter.writeUint8(this.#state);
        this.#affects.forEach((affect) => this.bufferWriter.writeUint32LE(affect));

        return this.bufferWriter.buffer;
    }
}
