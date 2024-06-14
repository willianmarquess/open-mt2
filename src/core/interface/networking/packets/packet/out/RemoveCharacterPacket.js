import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

export default class RemoveCharacterPacket extends PacketOut {
    #vid;

    constructor({ vid } = {}) {
        super({
            header: PacketHeaderEnum.CHARACTER_REMOVE,
            name: 'RemoveCharacterPacket',
            size: 5,
        });
        this.#vid = vid;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.#vid);
        return this.bufferWriter.buffer;
    }
}
