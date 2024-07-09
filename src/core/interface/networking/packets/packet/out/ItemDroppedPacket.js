import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

export default class ItemDroppedPacket extends PacketOut {
    #positionX;
    #positionY;
    #positionZ = 0;
    #virtualId;
    #id;

    constructor({ id, positionX, positionY, virtualId } = {}) {
        super({
            header: PacketHeaderEnum.ITEM_DROPPED,
            name: 'ItemDroppedPacket',
            size: 21,
        });
        this.#id = id;
        this.#positionX = positionX;
        this.#positionY = positionY;
        this.#virtualId = virtualId;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.#positionX);
        this.bufferWriter.writeUint32LE(this.#positionY);
        this.bufferWriter.writeUint32LE(this.#positionZ);
        this.bufferWriter.writeUint32LE(this.#virtualId);
        this.bufferWriter.writeUint32LE(this.#id);
        return this.bufferWriter.buffer;
    }
}
