import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

export default class LoginFailedPacket extends PacketOut {
    #status;

    constructor({ status } = {}) {
        super({
            header: PacketHeaderEnum.LOGIN_FAILED,
            name: 'LoginFailedPacket',
            size: 10,
        });
        this.#status = status;
    }

    pack() {
        this.bufferWriter.writeString(this.#status, this.#status.length + 1);
        return this.bufferWriter.buffer;
    }
}
