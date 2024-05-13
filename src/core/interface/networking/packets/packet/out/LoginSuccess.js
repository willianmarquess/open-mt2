import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

export default class LoginSuccessPacket extends PacketOut {
    #key;
    #result;

    constructor({ key, result } = {}) {
        super({
            header: PacketHeaderEnum.LOGIN_SUCCESS,
            name: 'LoginSuccessPacket',
            size: 6,
        });
        this.#key = key;
        this.#result = result;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.#key);
        this.bufferWriter.writeUint8(this.#result);
        return this.bufferWriter.buffer;
    }
}
