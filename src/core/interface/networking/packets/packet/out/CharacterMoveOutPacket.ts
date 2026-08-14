import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name CharacterMoveOutPacket
 * @header 0x03
 * @size 24
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
 */

export default class CharacterMoveOutPacket extends PacketOut {
    private readonly vid: number;
    private readonly movementType: number;
    private readonly arg: number;
    private readonly rotation: number;
    private readonly positionX: number;
    private readonly positionY: number;
    private readonly time: number;
    private readonly duration: number;

    constructor({
        vid,
        movementType,
        arg,
        rotation,
        positionX,
        positionY,
        time,
        duration,
    }: {
        vid: number;
        movementType: number;
        arg: number;
        rotation: number;
        positionX: number;
        positionY: number;
        time: number;
        duration: number;
    }) {
        super({
            header: PacketHeaderEnum.CHARACTER_MOVE_OUT,
            name: 'CharacterMoveOutPacket',
            size: 24,
        });
        this.vid = vid;
        this.movementType = movementType;
        this.arg = arg;
        this.rotation = rotation;
        this.positionX = positionX;
        this.positionY = positionY;
        this.time = time;
        this.duration = duration;
    }

    pack() {
        this.bufferWriter.writeUint8(this.movementType);
        this.bufferWriter.writeUint8(this.arg);
        this.bufferWriter.writeUint8(this.rotation);
        this.bufferWriter.writeUint32LE(this.vid);
        this.bufferWriter.writeUint32LE(this.positionX);
        this.bufferWriter.writeUint32LE(this.positionY);
        this.bufferWriter.writeUint32LE(this.time);
        this.bufferWriter.writeUint32LE(this.duration);

        return this.bufferWriter.getBuffer();
    }
}
