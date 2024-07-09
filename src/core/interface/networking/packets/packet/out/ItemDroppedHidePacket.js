import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

export default class ItemDroppedHidePacket extends PacketOut {
    #virtualId;

    constructor({ virtualId } = {}) {
        super({
            header: PacketHeaderEnum.ITEM_DROPPED_HIDE,
            name: 'ItemDroppedHidePacket',
            size: 21,
        });
        this.#virtualId = virtualId;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.#virtualId);
        return this.bufferWriter.buffer;
    }
}
