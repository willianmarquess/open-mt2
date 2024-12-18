import { PacketHeaderEnum } from "@/core/enum/PacketHeaderEnum";
import PacketOut from "@/core/interface/networking/packets/packet/out/PacketOut"

type CharacterInfoParams = {
    id: number,
    name: string,
    playerClass: number,
    level: number,
    playTime: number,
    st: number,
    ht: number,
    dx: number,
    iq: number,
    bodyPart: number,
    nameChange: number,
    hairPart: number,
    positionX: number,
    positionY: number,
    ip: number,
    port: number,
    skillGroup: number,
}

/**
 * @packet
 * @type Out
 * @name CharactersInfoPacket
 * @header 0x20
 * @size 329
 * @description Is used to send the characters list to client select screen (we need to repeat the characterInfo 4x, guildIds 4x, guildNames 4x).
 * @fields
 *   - {byte} header 1 Packet header.
 *   - {int} id 4 Character identification in server.
 *   - {string} name 25 Name of character (ascii).
 *   - {byte} playerClass 1 Number which indicates the player class (See the number of each class in JobEnum).
 *   - {byte} level 1 Number which indicates the player level.
 *   - {int} playtime 4 Time the player played with this character in minutes.
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
 *   - {int} Ip 4 Ip Address to server where the map the player is on is managed (for now we have only one server, but we can add remote maps to increase the quantity of players of our server).
 *   - {int} Port 4 Port to server where the map the player is on is managed (for now we have only one server, but we can add remote maps to increase the quantity of players of our server).
 *   - {byte} skillGroup 1 Number which indicates the skill group of character (to be implemented).
 *   - {int} guildId 4 The guild id of current character
 *   - {string} guildName 13 The guild name of current character (ascii).
 *   - {int} unknown 4 filled with 0.
 *   - {int} unknown 4 filled with 0.
 */

const defaultCharacterInfo = {
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
    port: '',
    skillGroup: 0,
};

export default class CharactersInfoPacket extends PacketOut {
    private characters: Array<CharacterInfoParams> = new Array(4).fill(defaultCharacterInfo);
    private guildIds: Array<number> = new Array(4).fill(0);
    private guildNames: Array<string> = new Array(4).fill('');

    constructor() {
        super({
            header: PacketHeaderEnum.CHARACTERS_LIST,
            name: 'CharactersInfoPacket',
            size: 329,
        });
    }

    addCharacter(
        pos: number,
        {
            id,
            name,
            playerClass,
            level,
            playTime,
            st,
            ht,
            dx,
            iq,
            bodyPart,
            nameChange,
            hairPart,
            positionX,
            positionY,
            ip,
            port,
            skillGroup,
        }: CharacterInfoParams,
        guildId: number = 0,
        guildName: string = '',
    ) {
        this.characters[pos] = {
            id,
            name,
            playerClass,
            level,
            playTime,
            st,
            ht,
            dx,
            iq,
            bodyPart,
            nameChange,
            hairPart,
            positionX,
            positionY,
            ip,
            port,
            skillGroup,
        };
        this.guildIds[pos] = guildId;
        this.guildNames[pos] = guildName;
    }

    pack() {
        this.characters.forEach((char) => {
            this.bufferWriter.writeUint32LE(char.id);
            this.bufferWriter.writeString(char.name, 25);
            this.bufferWriter.writeUint8(char.playerClass);
            this.bufferWriter.writeUint8(char.level);
            this.bufferWriter.writeUint32LE(char.playTime);
            this.bufferWriter.writeUint8(char.st);
            this.bufferWriter.writeUint8(char.ht);
            this.bufferWriter.writeUint8(char.dx);
            this.bufferWriter.writeUint8(char.iq);
            this.bufferWriter.writeUint16LE(char.bodyPart);
            this.bufferWriter.writeUint8(char.nameChange);
            this.bufferWriter.writeUint16LE(char.hairPart);
            this.bufferWriter.writeUint32LE(0);
            this.bufferWriter.writeUint32LE(char.positionX);
            this.bufferWriter.writeUint32LE(char.positionY);
            this.bufferWriter.writeUint32LE(char.ip);
            this.bufferWriter.writeUint16LE(char.port);
            this.bufferWriter.writeUint8(char.skillGroup);
        });
        this.guildIds.forEach((id) => this.bufferWriter.writeUint32LE(id));
        this.guildNames.forEach((name) => this.bufferWriter.writeString(name, 13));
        this.bufferWriter.writeUint32LE(0);
        this.bufferWriter.writeUint32LE(0);

        return this.bufferWriter.getBuffer();
    }
}
