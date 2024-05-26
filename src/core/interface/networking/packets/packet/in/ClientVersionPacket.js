import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketIn from './PacketIn.js';

export default class ClientVersionPacket extends PacketIn {
    #clientName;
    #timeStamp;

    constructor({ clientName, timeStamp } = {}) {
        super({
            header: PacketHeaderEnum.CLIENT_VERSION,
            name: 'ClientVersionPacket',
            size: 67,
        });
        this.#clientName = clientName;
        this.#timeStamp = timeStamp;
    }

    get clientName() {
        return this.#clientName;
    }

    get timeStamp() {
        return this.#timeStamp;
    }

    unpack(buffer) {
        this.bufferReader.setBuffer(buffer);
        this.#clientName = this.bufferReader.readString(33);
        this.#timeStamp = this.bufferReader.readString(33);

        return this;
    }
}
