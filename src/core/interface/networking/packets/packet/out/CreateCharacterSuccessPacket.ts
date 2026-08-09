import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

type CharacterParams = {
    id: number;
    name: string;
    playerClass: number;
    level: number;
    playTime: number;
    st: number;
    ht: number;
    dx: number;
    iq: number;
    bodyPart: number;
    nameChange: number;
    hairPart: number;
    positionX: number;
    positionY: number;
    ip: number;
    port: number;
    skillGroup: number;
};

const defaultCharacterInfo: CharacterParams = {
    id: 0,
    name: '',
    playerClass: 0,
    level: 0,
    playTime: 0,
    st: 0,
    ht: 0,
    dx: 0,
    iq: 0,
    bodyPart: 0,
    nameChange: 0,
    hairPart: 0,
    positionX: 0,
    positionY: 0,
    ip: 0,
    port: 0,
    skillGroup: 0,
};

/**
 * @packet
 * @type Out
 * @name CreateCharacterSuccessPacket
 * @header 0x08
 * @size 65
 * @description Sent when the character creation succeeds, it carries the slot plus the same character block used by the characters list (one character only, not repeated).
 * @fields
 *   - {byte} header 1 Packet header
 *   - {byte} slot 1 Account character slot the new character was created on (0 to 3).
 *   - {int} id 4 Character identification in server.
 *   - {string} name 25 Name of character (ascii).
 *   - {byte} playerClass 1 Number which indicates the player class (See the number of each class in JobEnum).
 *   - {byte} level 1 Number which indicates the player level.
 *   - {int} playTime 4 Time the player played with this character in minutes.
 *   - {byte} st 1 Number which indicates the st point quantity (strength).
 *   - {byte} ht 1 Number which indicates the ht point quantity (vitality).
 *   - {byte} dx 1 Number which indicates the dx point quantity (dexterity).
 *   - {byte} iq 1 Number which indicates the iq point quantity (intelligence).
 *   - {short} bodyPart 2 Number which indicates the id of the body part.
 *   - {byte} nameChange 1 Number which indicates if that character need to change name (0 or 1).
 *   - {short} hairPart 2 Number which indicates the id of the hair part.
 *   - {int} unknown 4 filled with 0.
 *   - {int} positionX 4 Position X of player in game
 *   - {int} positionY 4 Position Y of player in game
 *   - {int} ip 4 Ip address of the server which manages the map the player is on.
 *   - {short} port 2 Port of the server which manages the map the player is on.
 *   - {byte} skillGroup 1 Number which indicates the skill group of character (to be implemented).
 */

export default class CreateCharacterSuccessPacket extends PacketOut {
    private readonly slot: number;
    private readonly character: CharacterParams;

    constructor({ slot, character = defaultCharacterInfo }: { slot: number; character?: CharacterParams }) {
        super({
            header: PacketHeaderEnum.CREATE_CHARACTER_SUCCESS,
            name: 'CreateCharacterSuccessPacket',
            size: 65,
        });
        this.slot = slot;
        this.character = character;
    }

    pack() {
        this.bufferWriter.writeUint8(this.slot);
        this.bufferWriter.writeUint32LE(this.character.id);
        this.bufferWriter.writeString(this.character.name, 25);
        this.bufferWriter.writeUint8(this.character.playerClass);
        this.bufferWriter.writeUint8(this.character.level);
        this.bufferWriter.writeUint32LE(this.character.playTime);
        this.bufferWriter.writeUint8(this.character.st);
        this.bufferWriter.writeUint8(this.character.ht);
        this.bufferWriter.writeUint8(this.character.dx);
        this.bufferWriter.writeUint8(this.character.iq);
        this.bufferWriter.writeUint16LE(this.character.bodyPart);
        this.bufferWriter.writeUint8(this.character.nameChange);
        this.bufferWriter.writeUint16LE(this.character.hairPart);
        this.bufferWriter.writeUint32LE(0);
        this.bufferWriter.writeUint32LE(this.character.positionX);
        this.bufferWriter.writeUint32LE(this.character.positionY);
        this.bufferWriter.writeUint32LE(this.character.ip);
        this.bufferWriter.writeUint16LE(this.character.port);
        this.bufferWriter.writeUint8(this.character.skillGroup);

        return this.bufferWriter.getBuffer();
    }
}
