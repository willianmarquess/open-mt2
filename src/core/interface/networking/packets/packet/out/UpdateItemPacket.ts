import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

class ItemBonus {
    public readonly id: number;
    public readonly value: number;
    constructor({ id = 0, value = 0 } = {}) {
        this.id = id;
        this.value = value;
    }
}

type ItemUpdatePacketParams = {
    window?: number;
    position?: number;
    count?: number;
    sockets?: Array<number>;
    bonuses?: Array<ItemBonus>;
};

export default class UpdateItemPacket extends PacketOut {
    private readonly window: number;
    private readonly position: number;
    private readonly count: number;
    private readonly sockets = new Array<number>(3).fill(0);
    private readonly bonuses = new Array<ItemBonus>(
        new ItemBonus(),
        new ItemBonus(),
        new ItemBonus(),
        new ItemBonus(),
        new ItemBonus(),
        new ItemBonus(),
        new ItemBonus(),
    );

    constructor({ position, count, sockets, bonuses, window }: ItemUpdatePacketParams = {}) {
        super({
            header: PacketHeaderEnum.ITEM_UPDATE,
            name: 'UpdateItemPacket',
            size: 38,
        });
        this.window = window;
        this.position = position;
        this.count = count;
        this.sockets = sockets;
        this.bonuses = bonuses;
        this.sockets = new Array(3).fill(0);
        this.bonuses = [
            new ItemBonus({}),
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
        this.bufferWriter.writeUint8(this.count);
        this.sockets.forEach((socket) => this.bufferWriter.writeUint32LE(socket));
        this.bonuses.forEach(({ id, value }) => {
            this.bufferWriter.writeUint8(id);
            this.bufferWriter.writeUint16LE(value);
        });
        return this.bufferWriter.getBuffer();
    }
}
