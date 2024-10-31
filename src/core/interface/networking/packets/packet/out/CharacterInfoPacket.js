import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

/**
 * @packet
 * @type Out
 * @name CharacterInfoPacket
 * @header 0x88
 * @size 54
 * @description Represents the basic information about the character.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {int} vid 4 Player identification in game
 *   - {string} playerName 25 Name of player (ascii)
 *   - {short[4]} parts 8 Equipment parts
 *   - {byte} empireId 1 Id of empire
 *   - {int} guildId 4 Id of guild
 *   - {int} level 4 Player level
 *   - {short} rankPoints 2 Rank points
 *   - {byte} pkMode 1 If pk is enable
 *   - {int} mountId 4 Id of mount
 */

export default class CharacterInfoPacket extends PacketOut {
    #vid;
    #playerName;
    #parts = new Array(4).fill(0);
    #empireId;
    #guildId = 0;
    #level;
    #rankPoints;
    #pkMode;
    #mountId;

    constructor({ vid, playerName, parts, empireId, guildId, level, rankPoints, pkMode, mountId }) {
        super({
            header: PacketHeaderEnum.CHARACTER_INFO,
            name: 'CharacterInfoPacket',
            size: 54,
        });
        this.#vid = vid;
        this.#playerName = playerName;
        this.#parts = parts ?? this.#parts;
        this.#empireId = empireId;
        this.#guildId = guildId ?? this.#guildId;
        this.#level = level;
        this.#rankPoints = rankPoints;
        this.#pkMode = pkMode;
        this.#mountId = mountId;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.#vid);
        this.bufferWriter.writeString(this.#playerName, 25);
        this.#parts.forEach((part) => this.bufferWriter.writeUint16LE(part));
        this.bufferWriter.writeUint8(this.#empireId);
        this.bufferWriter.writeUint32LE(this.#guildId);
        this.bufferWriter.writeUint32LE(this.#level);
        this.bufferWriter.writeUint16LE(this.#rankPoints);
        this.bufferWriter.writeUint8(this.#pkMode);
        this.bufferWriter.writeUint32LE(this.#mountId);

        return this.bufferWriter.buffer;
    }
}
