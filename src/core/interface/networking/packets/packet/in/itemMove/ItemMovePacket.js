import PacketHeaderEnum from '../../../../../../enum/PacketHeaderEnum.js';
import PacketIn from '../PacketIn.js';
import ItemMovePacketValidator from './ItemMovePacketValidator.js';

export default class ItemMovePacket extends PacketIn {
    #fromWindow;
    #fromPosition;
    #toWindow;
    #toPosition;
    #count;

    constructor({ fromWindow, fromPosition, toWindow, toPosition, count } = {}) {
        super({
            header: PacketHeaderEnum.ITEM_MOVE,
            name: 'ItemMovePacket',
            size: 9,
            validator: ItemMovePacketValidator,
        });
        this.#fromWindow = fromWindow;
        this.#fromPosition = fromPosition;
        this.#toWindow = toWindow;
        this.#toPosition = toPosition;
        this.#count = count;
    }

    get fromWindow() {
        return this.#fromWindow;
    }

    get fromPosition() {
        return this.#fromPosition;
    }

    get toWindow() {
        return this.#toWindow;
    }

    get toPosition() {
        return this.#toPosition;
    }

    get count() {
        return this.#count;
    }

    unpack(buffer) {
        this.bufferReader.setBuffer(buffer);
        this.#fromWindow = this.bufferReader.readUInt8();
        this.#fromPosition = this.bufferReader.readUInt16LE();
        this.#toWindow = this.bufferReader.readUInt8();
        this.#toPosition = this.bufferReader.readUInt16LE();
        this.#count = this.bufferReader.readUInt8();
        this.validate();
        return this;
    }
}
