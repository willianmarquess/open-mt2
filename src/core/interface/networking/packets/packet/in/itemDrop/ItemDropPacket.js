import PacketHeaderEnum from '../../../../../../enum/PacketHeaderEnum.js';
import PacketIn from '../PacketIn.js';
import ItemDropPacketValidator from './ItemDropPacketValidator.js';

export default class ItemDropPacket extends PacketIn {
    #window;
    #position;
    #gold;
    #count;

    constructor({ window, position, gold, count } = {}) {
        super({
            header: PacketHeaderEnum.ITEM_DROP,
            name: 'ItemDropPacket',
            size: 5,
            validator: ItemDropPacketValidator,
        });
        this.#window = window;
        this.#position = position;
        this.#gold = gold;
        this.#count = count;
    }

    get window() {
        return this.#window;
    }

    get position() {
        return this.#position;
    }

    get gold() {
        return this.#gold;
    }

    get count() {
        return this.#count;
    }

    unpack(buffer) {
        this.bufferReader.setBuffer(buffer);
        this.#window = this.bufferReader.readUInt8();
        this.#position = this.bufferReader.readUInt16LE();
        this.#gold = this.bufferReader.readUInt32LE();
        this.#count = this.bufferReader.readUInt8();
        this.validate();
        return this;
    }
}
