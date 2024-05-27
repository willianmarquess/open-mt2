import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

export default class GameTimePacket extends PacketOut {
    #time;

    constructor({ time } = {}) {
        super({
            header: PacketHeaderEnum.GAME_TIME,
            name: 'GameTimePacket',
            size: 5,
        });
        this.#time = time;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.#time);
        return this.bufferWriter.buffer;
    }
}
