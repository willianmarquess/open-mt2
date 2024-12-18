import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

class ItemBonus {
    public id: number;
    public value: number;
    constructor({ id = 0, value = 0 }) {
        this.id = id;
        this.value = value;
    }
}

type ItemPacketParams = {
    window?: number;
    position?: number;
    id?: number;
    count?: number;
    flags?: number;
    antiFlags?: number;
    highlight?: number;
    sockets?: Array<number>;
    bonuses?: Array<ItemBonus>;
};

export default class ItemPacket extends PacketOut {
    private window: number;
    private position: number;
    private id: number;
    private count: number;
    private flags: number;
    private antiFlags: number;
    private highlight: number;
    private sockets = new Array<number>(3).fill(0);
    private bonuses = new Array<ItemBonus>(
        new ItemBonus({}),
        new ItemBonus({}),
        new ItemBonus({}),
        new ItemBonus({}),
        new ItemBonus({}),
        new ItemBonus({}),
    );

    constructor({ window, position, id, count, flags, antiFlags, highlight, sockets, bonuses }: ItemPacketParams = {}) {
        super({
            header: PacketHeaderEnum.ITEM,
            name: 'ItemPacket',
            size: 54,
        });
        this.window = window;
        this.position = position;
        this.id = id;
        this.count = count;
        this.flags = flags;
        this.antiFlags = antiFlags;
        this.highlight = highlight;
        this.sockets = sockets;
        this.bonuses = bonuses;

        this.flags = 0;
        this.antiFlags = 0;
        this.highlight = 0;
        this.sockets = new Array(3).fill(0);
        this.bonuses = [
            new ItemBonus({}),
            new ItemBonus({}),
            new ItemBonus({}),
            new ItemBonus({}),
            new ItemBonus({}),
            new ItemBonus({}),
        ];
    }

    pack() {
        this.bufferWriter.writeUint8(this.window);
        this.bufferWriter.writeUint16LE(this.position);
        this.bufferWriter.writeUint32LE(this.id);
        this.bufferWriter.writeUint8(this.count);
        this.bufferWriter.writeUint32LE(this.flags);
        this.bufferWriter.writeUint32LE(this.antiFlags);
        this.bufferWriter.writeUint32LE(this.highlight);
        this.sockets.forEach((socket) => this.bufferWriter.writeUint32LE(socket));
        this.bonuses.forEach(({ id, value }) => {
            this.bufferWriter.writeUint8(id);
            this.bufferWriter.writeUint16LE(value);
        });
        return this.bufferWriter.getBuffer();
    }
}
