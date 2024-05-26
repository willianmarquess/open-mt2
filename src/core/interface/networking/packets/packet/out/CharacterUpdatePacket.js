import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

export default class CharacterUpdatePacket extends PacketOut {
    #vid;
    #parts = new Array(4).fill(0);
    #moveSpeed = 0;
    #attackSpeed = 0;
    #state = 0;
    #affects = new Array(2).fill(0);
    #guildId = 0;
    #rankPoints = 0;
    #pkMode = 0;
    #mountVnum = 0;

    constructor({ vid, parts, moveSpeed, attackSpeed, state, affects, guildId, rankPoints, pkMode, mountVnum } = {}) {
        super({
            header: PacketHeaderEnum.CHARACTER_UPDATE,
            name: 'CharacterUpdatePacket',
            size: 35,
        });
        this.#vid = vid;
        this.#parts = parts ?? this.#parts;
        this.#moveSpeed = moveSpeed ?? this.#moveSpeed;
        this.#attackSpeed = attackSpeed ?? this.#attackSpeed;
        this.#state = state ?? this.#state;
        this.#affects = affects ?? this.#affects;
        this.#guildId = guildId ?? this.#guildId;
        this.#rankPoints = rankPoints ?? this.#rankPoints;
        this.#pkMode = pkMode ?? this.#pkMode;
        this.#mountVnum = mountVnum ?? this.#mountVnum;
    }

    get vid() {
        return this.#vid;
    }

    get parts() {
        return this.#parts;
    }

    get moveSpeed() {
        return this.#moveSpeed;
    }

    get attackSpeed() {
        return this.#attackSpeed;
    }

    get state() {
        return this.#state;
    }

    get affects() {
        return this.#affects;
    }

    get guildId() {
        return this.#guildId;
    }

    get rankPoints() {
        return this.#rankPoints;
    }

    get pkMode() {
        return this.#pkMode;
    }

    get mountVnum() {
        return this.#mountVnum;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.#vid);
        this.#parts.forEach((part) => this.bufferWriter.writeUint16LE(part));
        this.bufferWriter.writeUint8(this.#moveSpeed);
        this.bufferWriter.writeUint8(this.#attackSpeed);
        this.bufferWriter.writeUint8(this.#state);
        this.#affects.forEach((affect) => this.bufferWriter.writeUint32LE(affect));
        this.bufferWriter.writeUint32LE(this.#guildId);
        this.bufferWriter.writeUint16LE(this.#rankPoints);
        this.bufferWriter.writeUint8(this.#pkMode);
        this.bufferWriter.writeUint32LE(this.#mountVnum);

        return this.bufferWriter.buffer;
    }
}
