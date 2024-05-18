import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketBidirectional from './PacketBidirectional.js';

export default class EmpirePacket extends PacketBidirectional {
    #empireId;

    constructor({ empireId } = {}) {
        super({
            header: PacketHeaderEnum.EMPIRE,
            name: 'EmpirePacket',
            size: 3,
        });
        this.#empireId = empireId;
    }

    get empireId() {
        return this.#empireId;
    }

    pack() {
        this.bufferWriter.writeUint8(this.#empireId).writeUint8(0);
        return this.bufferWriter.buffer;
    }

    unpack(buffer) {
        this.bufferReader.setBuffer(buffer);
        this.#empireId = this.bufferReader.readUInt8();
        return this;
    }
}
