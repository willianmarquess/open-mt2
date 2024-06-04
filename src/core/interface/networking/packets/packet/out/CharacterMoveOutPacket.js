import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

export default class CharacterMoveOutPacket extends PacketOut {
    #vid;
    #movementType;
    #arg;
    #rotation;
    #positionX;
    #positionY;
    #time;
    #duration;

    constructor({ vid, movementType, arg, rotation, positionX, positionY, time, duration }) {
        super({
            header: PacketHeaderEnum.CHARACTER_MOVE_OUT,
            name: 'CharacterMoveOutPacket',
            size: 25,
        });
        this.#vid = vid;
        this.#movementType = movementType;
        this.#arg = arg;
        this.#rotation = rotation;
        this.#positionX = positionX;
        this.#positionY = positionY;
        this.#time = time;
        this.#duration = duration;
    }

    pack() {
        this.bufferWriter.writeUint8(this.#movementType);
        this.bufferWriter.writeUint8(this.#arg);
        this.bufferWriter.writeUint8(this.#rotation);
        this.bufferWriter.writeUint32LE(this.#vid);
        this.bufferWriter.writeUint32LE(this.#positionX);
        this.bufferWriter.writeUint32LE(this.#positionY);
        this.bufferWriter.writeUint32LE(this.#time);
        this.bufferWriter.writeUint32LE(this.#duration);
        this.bufferWriter.writeUint8(0);

        return this.bufferWriter.buffer;
    }
}
