import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

class ItemBonus {
    constructor({ id = 0, value = 0 }) {
        this.id = id;
        this.value = value;
    }
}

export default class ItemPacket extends PacketOut {
    #window;
    #position;
    #id;
    #count;
    #flags;
    #antiFlags;
    #highlight;
    #sockets = new Array(3);
    #bonuses = new Array(
        new ItemBonus({}),
        new ItemBonus({}),
        new ItemBonus({}),
        new ItemBonus({}),
        new ItemBonus({}),
        new ItemBonus({}),
    );

    constructor({ window, position, id, count, flags, antiFlags, highlight, sockets, bonuses } = {}) {
        super({
            header: PacketHeaderEnum.ITEM,
            name: 'ItemPacket',
            size: 54,
        });
        this.#window = window;
        this.#position = position;
        this.#id = id;
        this.#count = count;
        this.#flags = flags;
        this.#antiFlags = antiFlags;
        this.#highlight = highlight;
        this.#sockets = sockets;
        this.#bonuses = bonuses;

        this.#sockets = new Array(3);
        this.#bonuses = new Array(
            new ItemBonus({}),
            new ItemBonus({}),
            new ItemBonus({}),
            new ItemBonus({}),
            new ItemBonus({}),
            new ItemBonus({}),
        );
    }

    pack() {
        this.bufferWriter.writeUint8(this.#window);
        this.bufferWriter.writeUint16LE(this.#position);
        this.bufferWriter.writeUint32LE(this.#id);
        this.bufferWriter.writeUint8(this.#count);
        this.bufferWriter.writeUint32LE(this.#flags);
        this.bufferWriter.writeUint32LE(this.#antiFlags);
        this.bufferWriter.writeUint32LE(this.#highlight);
        this.#sockets.forEach((socket) => this.bufferWriter.writeUint32LE(socket));
        this.#bonuses.forEach(({ id, value }) => {
            this.bufferWriter.writeUint8(id);
            this.bufferWriter.writeUint16LE(value);
        });
        return this.bufferWriter.buffer;
    }
}
