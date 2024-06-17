import PacketHeaderEnum from '../../../../../../enum/PacketHeaderEnum.js';
import PacketIn from '../PacketIn.js';
import CharacterMovePacketValidator from './CharacterMovePacketValidator.js';

export default class CharacterMovePacket extends PacketIn {
    #movementType;
    #arg;
    #rotation;
    #positionX;
    #positionY;
    #time;

    constructor({ movementType, arg, rotation, positionX, positionY, time } = {}) {
        super({
            header: PacketHeaderEnum.CHARACTER_MOVE,
            name: 'CharacterMovePacket',
            size: 17,
            validator: CharacterMovePacketValidator,
        });
        this.#movementType = movementType;
        this.#arg = arg;
        this.#rotation = rotation;
        this.#positionX = positionX;
        this.#positionY = positionY;
        this.#time = time;
    }

    get movementType() {
        return this.#movementType;
    }
    get arg() {
        return this.#arg;
    }
    get rotation() {
        return this.#rotation;
    }
    get positionX() {
        return this.#positionX;
    }
    get positionY() {
        return this.#positionY;
    }
    get time() {
        return this.#time;
    }

    unpack(buffer) {
        this.bufferReader.setBuffer(buffer);
        this.#movementType = this.bufferReader.readUInt8();
        this.#arg = this.bufferReader.readUInt8();
        this.#rotation = this.bufferReader.readUInt8();
        this.#positionX = this.bufferReader.readUInt32LE();
        this.#positionY = this.bufferReader.readUInt32LE();
        this.#time = this.bufferReader.readUInt32LE();
        this.validate();
        return this;
    }
}
