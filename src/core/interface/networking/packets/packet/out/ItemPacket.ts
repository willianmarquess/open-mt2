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

/**
 * @packet
 * @type Out
 * @name ItemPacket
 * @header 0x15
 * @size 51
 * @description Sets an item into a client window cell (inventory, equipment, ...). The bonusId/bonusValue pair is repeated 7x, one per item attribute slot.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {byte} window 1 Window the cell belongs to (See WindowTypeEnum)
 *   - {short} position 2 Cell position inside the window
 *   - {int} id 4 Item vnum (prototype id)
 *   - {byte} count 1 Stack size of the item
 *   - {int} flags 4 Item flags, currently always sent as 0
 *   - {int} antiFlags 4 Item anti flags, currently always sent as 0
 *   - {byte} highlight 1 Non zero highlights the cell in the client, currently always sent as 0
 *   - {int[3]} sockets 12 Metin socket values, 3 slots of 4 bytes
 *   - {byte} bonusId 1 Attribute type of the bonus slot, repeated 7x
 *   - {short} bonusValue 2 Attribute value of the bonus slot, repeated 7x
 */

export default class ItemPacket extends PacketOut {
    private readonly window: number;
    private readonly position: number;
    private readonly id: number;
    private readonly count: number;
    private readonly flags: number;
    private readonly antiFlags: number;
    private readonly highlight: number;
    private readonly sockets = new Array<number>(3).fill(0);
    private readonly bonuses = new Array<ItemBonus>(
        new ItemBonus({}),
        new ItemBonus({}),
        new ItemBonus({}),
        new ItemBonus({}),
        new ItemBonus({}),
        new ItemBonus({}),
        new ItemBonus({}),
    );

    constructor({
        window,
        position,
        id,
        count,
        flags,
        antiFlags,
        highlight,
        sockets,
        bonuses,
    }: {
        window: number;
        position: number;
        id: number;
        count: number;
        flags: number;
        antiFlags: number;
        highlight: number;
        sockets?: Array<number>;
        bonuses?: Array<ItemBonus>;
    }) {
        super({
            header: PacketHeaderEnum.ITEM,
            name: 'ItemPacket',
            size: 51,
        });
        this.window = window;
        this.position = position;
        this.id = id;
        this.count = count;
        this.flags = flags;
        this.antiFlags = antiFlags;
        this.highlight = highlight;
        this.flags = 0;
        this.antiFlags = 0;
        this.highlight = 0;
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
        this.bufferWriter.writeUint32LE(this.id);
        this.bufferWriter.writeUint8(this.count);
        this.bufferWriter.writeUint32LE(this.flags);
        this.bufferWriter.writeUint32LE(this.antiFlags);
        this.bufferWriter.writeUint8(this.highlight);
        this.sockets.forEach((socket) => this.bufferWriter.writeUint32LE(socket));
        this.bonuses.forEach(({ id, value }) => {
            this.bufferWriter.writeUint8(id);
            this.bufferWriter.writeUint16LE(value);
        });
        return this.bufferWriter.getBuffer();
    }
}
