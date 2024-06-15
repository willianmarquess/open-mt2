import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

export default class ChatOutPacket extends PacketOut {
    #messageType;
    #message;
    #vid;
    #empireId;

    constructor({ messageType, vid, empireId, message = '' } = {}) {
        super({
            header: PacketHeaderEnum.CHAT_OUT,
            name: 'ChatOutPacket',
            size: 9 + message.length + 1,
        });
        this.#messageType = messageType;
        this.#message = message;
        this.#vid = vid;
        this.#empireId = empireId;
    }

    pack() {
        this.bufferWriter.writeUint16LE(this.size);
        this.bufferWriter.writeUint8(this.#messageType);
        this.bufferWriter.writeUint32LE(this.#vid);
        this.bufferWriter.writeUint8(this.#empireId);
        this.bufferWriter.writeString(this.#message, this.#message.length + 1);
        return this.bufferWriter.buffer;
    }
}
