import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

export default class CharacterPointChangePacket extends PacketOut {
    #vid;
    #type;
    #amount;
    #value;

    constructor({ vid, type, amount, value } = {}) {
        super({
            header: PacketHeaderEnum.CHARACTER_POINT_CHANGE,
            name: 'CharacterPointChangePacket',
            size: 22,
        });
        this.#vid = vid;
        this.#type = type;
        this.#amount = amount;
        this.#value = value;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.#vid);
        this.bufferWriter.writeUint8(this.#type);
        this.bufferWriter.writeUint64LE(this.#amount);
        this.bufferWriter.writeUint64LE(this.#value);
        return this.bufferWriter.buffer;
    }
}
