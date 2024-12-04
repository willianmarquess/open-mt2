import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

const PLAYER_NAME_MAX_LENGTH = 25;

export default class SetItemOwnershipPacket extends PacketOut {
    #virtualId;
    #ownerName;

    constructor({ ownerName, virtualId } = {}) {
        super({
            header: PacketHeaderEnum.SET_ITEM_OWNERSHIP,
            name: 'SetItemOwnershipPacket',
            size: 5 + PLAYER_NAME_MAX_LENGTH,
        });
        this.#virtualId = virtualId;
        this.#ownerName = ownerName;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.#virtualId);
        this.bufferWriter.writeString(this.#ownerName, PLAYER_NAME_MAX_LENGTH);
        return this.bufferWriter.buffer;
    }
}
