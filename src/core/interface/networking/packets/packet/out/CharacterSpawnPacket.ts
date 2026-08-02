import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name CharacterSpawnPacket
 * @header 0x01
 * @size 35
 * @description Is used to spawn a character (player, mob, npc) on the client of nearby players. The affect flag is repeated 2x.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {int} vid 4 Character identification in game
 *   - {float} rotation 4 Rotation of character in degrees
 *   - {int} positionX 4 Position X of character in game
 *   - {int} positionY 4 Position Y of character in game
 *   - {int} positionZ 4 Position Z of character in game
 *   - {byte} entityType 1 Kind of entity being spawned (See in EntityTypeEnum)
 *   - {short} playerClass 2 Class of player, or vnum of the mob/npc
 *   - {byte} movementSpeed 1 Movement speed of character
 *   - {byte} attackSpeed 1 Attack speed of character
 *   - {byte} state 1 State flag of character
 *   - {int[2]} affects 8 Affect flags of character
 */

export default class CharacterSpawnPacket extends PacketOut {
    private readonly vid: number;
    private readonly rotation: number = 0;
    private readonly positionX: number;
    private readonly positionY: number;
    private readonly positionZ: number;
    private readonly entityType: number;
    private readonly playerClass: number;
    private readonly movementSpeed: number;
    private readonly attackSpeed: number;
    private readonly state: number = 0;
    private readonly affects: Array<number> = new Array(2).fill(0);

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
        affects = new Array(2).fill(0),
    }: {
        vid: number;
        rotation: number;
        positionX: number;
        positionY: number;
        positionZ: number;
        entityType: number;
        playerClass: number;
        movementSpeed: number;
        attackSpeed: number;
        state: number;
        affects: Array<number>;
    }) {
        super({
            header: PacketHeaderEnum.CHARACTER_SPAWN,
            name: 'CharacterSpawnPacket',
            size: 35,
        });
        this.vid = vid;
        this.rotation = rotation ?? this.rotation;
        this.positionX = positionX;
        this.positionY = positionY;
        this.positionZ = positionZ;
        this.entityType = entityType;
        this.playerClass = playerClass;
        this.movementSpeed = movementSpeed;
        this.attackSpeed = attackSpeed;
        this.state = state ?? this.state;
        this.affects = affects ?? this.affects;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.vid);
        this.bufferWriter.writeFloatLE(this.rotation);
        this.bufferWriter.writeUint32LE(this.positionX);
        this.bufferWriter.writeUint32LE(this.positionY);
        this.bufferWriter.writeUint32LE(this.positionZ);
        this.bufferWriter.writeUint8(this.entityType);
        this.bufferWriter.writeUint16LE(this.playerClass);
        this.bufferWriter.writeUint8(this.movementSpeed);
        this.bufferWriter.writeUint8(this.attackSpeed);
        this.bufferWriter.writeUint8(this.state);
        this.affects.forEach((affect) => this.bufferWriter.writeUint32LE(affect));

        return this.bufferWriter.getBuffer();
    }
}
