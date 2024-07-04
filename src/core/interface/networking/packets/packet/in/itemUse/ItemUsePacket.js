import PacketHeaderEnum from '../../../../../../enum/PacketHeaderEnum.js';
import PacketIn from '../PacketIn.js';
import ItemUsePacketValidator from './ItemUsePacketValidator.js';

export default class ItemUsePacket extends PacketIn {
    #window;
    #position;

    constructor({ window, position } = {}) {
        super({
            header: PacketHeaderEnum.ITEM_USE,
            name: 'ItemUsePacket',
            size: 5,
            validator: ItemUsePacketValidator,
        });
        this.#window = window;
        this.#position = position;
    }

    get window() {
        return this.#window;
    }

    get position() {
        return this.#position;
    }

    unpack(buffer) {
        this.bufferReader.setBuffer(buffer);
        this.#window = this.bufferReader.readUInt8();
        this.#position = this.bufferReader.readUInt16LE();
        this.validate();
        return this;
    }
}
