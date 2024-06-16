import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketIn from './PacketIn.js';

export default class ChatInPacket extends PacketIn {
    #messageType;
    #message;

    constructor({ message, messageType } = {}) {
        super({
            header: PacketHeaderEnum.CHAT_IN,
            name: 'ChatInPacket',
            size: 5 + message?.length + 1,
        });

        this.#message = message;
        this.#messageType = messageType;
    }

    get message() {
        return this.#message;
    }
    get messageType() {
        return this.#messageType;
    }

    unpack(buffer) {
        this.bufferReader.setBuffer(buffer);
        this.bufferReader.readUInt16LE();
        this.#messageType = this.bufferReader.readUInt8();
        this.#message = this.bufferReader.readString();

        return this;
    }
}
