import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';
import { ShopSubHeaderGC } from '@/core/enum/ShopSubHeaderEnum';

// GC_SHOP / SHOP_SUBHEADER_GC_UPDATE_ITEM payload:
//  [1B header=0x26][2B size][1B subheader=0x02][1B pos][43B item]
//
// item = { vnum:4B  price:4B  count:1B  display_pos:1B  sockets[3]:12B  bonuses[7]:21B }
// An empty slot is represented with all-zero item fields (vnum=0).

const SOCKETS_COUNT = 3;
const BONUSES_COUNT = 7;
const ITEM_BYTES = 4 + 4 + 1 + 1 + SOCKETS_COUNT * 4 + BONUSES_COUNT * 3; // 43
const PACKET_SIZE = 1 + 2 + 1 + 1 + ITEM_BYTES; // 48 bytes

export type ShopUpdateItemParams = {
    pos: number;
    vnum?: number;
    price?: number;
    count?: number;
};

export default class ShopUpdateItemPacket extends PacketOut {
    private readonly pos: number;
    private readonly vnum: number;
    private readonly price: number;
    private readonly count: number;

    constructor({ pos, vnum = 0, price = 0, count = 0 }: ShopUpdateItemParams) {
        super({ header: PacketHeaderEnum.SHOP_OUT, size: PACKET_SIZE, name: 'ShopUpdateItemPacket' });
        this.pos = pos;
        this.vnum = vnum;
        this.price = price;
        this.count = count;
    }

    pack(): Buffer {
        this.bufferWriter.writeUint16LE(PACKET_SIZE);
        this.bufferWriter.writeUint8(ShopSubHeaderGC.UPDATE_ITEM);
        this.bufferWriter.writeUint8(this.pos);

        // Item fields
        this.bufferWriter.writeUint32LE(this.vnum);
        this.bufferWriter.writeUint32LE(this.price);
        this.bufferWriter.writeUint8(this.count);
        this.bufferWriter.writeUint8(this.pos); // display_pos

        for (let s = 0; s < SOCKETS_COUNT; s++) {
            this.bufferWriter.writeUint32LE(0);
        }
        for (let b = 0; b < BONUSES_COUNT; b++) {
            this.bufferWriter.writeUint8(0);
            this.bufferWriter.writeUint16LE(0);
        }

        return this.bufferWriter.getBuffer();
    }
}
