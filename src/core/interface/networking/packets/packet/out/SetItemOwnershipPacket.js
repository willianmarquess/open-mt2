import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

export default class SetItemOwnershipPacket extends PacketOut {
    #virtualId;
    #ownerName;

    constructor({ ownerName, virtualId } = {}) {
        super({
            header: PacketHeaderEnum.SET_ITEM_OWNERSHIP,
            name: 'SetItemOwnershipPacket',
            size: 5 + ownerName.length,
        });
        this.#virtualId = virtualId;
        this.#ownerName = ownerName;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.#virtualId);
        this.bufferWriter.writeString(this.#ownerName, this.#ownerName.length);
        return this.bufferWriter.buffer;
    }
}
