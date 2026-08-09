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

/**
 * @packet
 * @type Out
 * @name UpdateItemPacket
 * @header 0x19
 * @size 38
 * @description Updates the stack count, sockets and bonuses of an item already set in a client window cell. The bonusId/bonusValue pair is repeated 7x, one per item attribute slot.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {byte} window 1 Window the cell belongs to (See WindowTypeEnum)
 *   - {short} position 2 Cell position inside the window
 *   - {byte} count 1 New stack size of the item
 *   - {int[3]} sockets 12 Metin socket values, 3 slots of 4 bytes
 *   - {byte} bonusId 1 Attribute type of the bonus slot, repeated 7x
 *   - {short} bonusValue 2 Attribute value of the bonus slot, repeated 7x
 */

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

    constructor({
        position,
        count,
        sockets,
        bonuses,
        window,
    }: {
        position: number;
        count: number;
        sockets?: Array<number>;
        bonuses?: Array<ItemBonus>;
        window: number;
    }) {
        super({
            header: PacketHeaderEnum.ITEM_UPDATE,
            name: 'UpdateItemPacket',
            size: 38,
        });
        this.window = window;
        this.position = position;
        this.count = count;
        this.sockets = sockets ?? new Array(3).fill(0);
        this.bonuses = bonuses ?? [
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
