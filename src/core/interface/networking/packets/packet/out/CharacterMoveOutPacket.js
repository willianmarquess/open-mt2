import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

/**
 * @packet
 * @type Out
 * @name CharacterMoveOutPacket
 * @header 0x03
 * @size 25
 * @description Is used to replicate the movement of a character (player, mobs) to other nearby players.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {byte} movementType 1 Number which indicates the movement type (See in MovementTypeEnum)
 *   - {byte} arg 1 unknown
 *   - {byte} rotation 1 Indicate the rotation of char in degrees
 *   - {int} vid 4 Character identification in game
 *   - {int} positionX 4 Position X of character in game
 *   - {int} positionY 4 Position Y of character in game
 *   - {int} time 4 unknown
 *   - {int} duration 4 Number which indicates the duration of movement
 *   - {byte} unknown 1 filled with 0
 */

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
