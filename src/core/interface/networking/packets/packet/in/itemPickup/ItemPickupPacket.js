import PacketHeaderEnum from '../../../../../../enum/PacketHeaderEnum.js';
import PacketIn from '../PacketIn.js';
import ItemPickupPacketValidator from './ItemPickupPacketValidator.js';

export default class ItemPickupPacket extends PacketIn {
    #virtualId;

    constructor({ virtualId } = {}) {
        super({
            header: PacketHeaderEnum.ITEM_PICKUP,
            name: 'ItemPickupPacket',
            size: 5,
            validator: ItemPickupPacketValidator,
        });
        this.#virtualId = virtualId;
    }

    get virtualId() {
        return this.#virtualId;
    }

    unpack(buffer) {
        this.bufferReader.setBuffer(buffer);
        this.#virtualId = this.bufferReader.readUInt32LE();
        this.validate();
        return this;
    }
}
