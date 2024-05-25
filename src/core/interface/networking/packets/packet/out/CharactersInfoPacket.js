import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

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
    #characters = new Array(4).fill(defaultCharacterInfo);
    #guildIds = new Array(4).fill(0);
    #guildNames = new Array(4).fill('');

    constructor() {
        super({
            header: PacketHeaderEnum.CHARACTERS_LIST,
            name: 'CharactersListPacket',
            size: 329,
        });
    }

    get characters() {
        return this.#characters;
    }
    get guildIds() {
        return this.#guildIds;
    }
    get guildNames() {
        return this.#guildNames;
    }

    addCharacter(
        pos,
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
        },
        guildId = 0,
        guildName = '',
    ) {
        this.#characters[pos] = {
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
        this.#guildIds[pos] = guildId;
        this.#guildNames[pos] = guildName;
    }

    pack() {
        this.#characters.forEach((char) => {
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
        this.#guildIds.forEach((id) => this.bufferWriter.writeUint32LE(id));
        this.#guildNames.forEach((name) => this.bufferWriter.writeString(name, 13));
        this.bufferWriter.writeUint32LE(0);
        this.bufferWriter.writeUint32LE(0);

        return this.bufferWriter.buffer;
    }
}
