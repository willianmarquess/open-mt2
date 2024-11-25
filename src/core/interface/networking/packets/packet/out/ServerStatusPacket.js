import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

export default class ServerStatusPacket extends PacketOut {
    #status = [];
    #isSuccess;

    constructor({
        status = [
            {
                port: 0,
                status: 1,
            },
        ],
        isSuccess = true,
    } = {}) {
        super({
            header: PacketHeaderEnum.SERVER_STATUS,
            name: 'ServerStatusPacket',
            size: 9, //fixed for now
        });
        this.#status = status;
        this.#isSuccess = isSuccess ? 1 : 0;
    }

    #calcSize() {
        return 6 + this.#status.length * 3;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.#calcSize());
        this.#status.forEach((s) => {
            this.bufferWriter.writeUint16LE(s.port).writeUint8(s.status);
        });
        this.bufferWriter.writeUint8(this.#isSuccess);
        console.log('ServerStatusPacket', this.bufferWriter.buffer);
        return this.bufferWriter.buffer;
    }
}
