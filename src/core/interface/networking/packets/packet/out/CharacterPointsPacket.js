import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

export default class CharacterPointsPacket extends PacketOut {
    #points = new Array(255).fill(0);

    constructor() {
        super({
            header: PacketHeaderEnum.CHARACTER_POINTS,
            name: 'CharacterPointsPacket',
            size: 1021,
        });
    }

    get points() {
        return this.#points;
    }

    pack() {
        for (let i = 0; i < 255; i++) {
            this.bufferWriter.writeUint32LE(this.#points[i]);
        }
        return this.bufferWriter.buffer;
    }
}
