import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name CharacterDetailsPacket
 * @header 0x71
 * @size 46
 * @description Represents the detail information about the character.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {int} vid 4 Player identification in game
 *   - {short} playerClass 2 Number which indicates the player class (See the number of each class in JobEnum)
 *   - {string} playerName 25 Name of player (ascii)
 *   - {int} positionX 4 Position X of player in game
 *   - {int} positionY 4 Position Y of player in game
 *   - {int} positionZ 4 Position Z of player in game
 *   - {byte} empireId 1 Id of empire
 *   - {byte} skillGroup 1 Id of skill group
 */

export default class CharacterDetailsPacket extends PacketOut {
    private vid: number;
    private playerClass: number;
    private playerName: string;
    private positionX: number;
    private positionY: number;
    private positionZ: number;
    private empireId: number;
    private skillGroup: number;

    constructor({ vid, playerClass, playerName, positionX, positionY, positionZ, empireId, skillGroup }) {
        super({
            header: PacketHeaderEnum.CHARACTER_DETAILS,
            name: 'CharacterDetailsPacket',
            size: 46,
        });
        this.vid = vid;
        this.playerClass = playerClass;
        this.playerName = playerName;
        this.positionX = positionX;
        this.positionY = positionY;
        this.positionZ = positionZ;
        this.empireId = empireId;
        this.skillGroup = skillGroup;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.vid);
        this.bufferWriter.writeUint16LE(this.playerClass);
        this.bufferWriter.writeString(this.playerName, 25);
        this.bufferWriter.writeUint32LE(this.positionX);
        this.bufferWriter.writeUint32LE(this.positionY);
        this.bufferWriter.writeUint32LE(this.positionZ);
        this.bufferWriter.writeUint8(this.empireId);
        this.bufferWriter.writeUint8(this.skillGroup);

        return this.bufferWriter.getBuffer();
    }
}
