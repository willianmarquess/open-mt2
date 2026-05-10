import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';
import { ShopSubHeaderGC } from '@/core/enum/ShopSubHeaderEnum';
import { ShopItem } from '@/core/domain/shop/ShopItem';
import { SHOP_MAX_ITEMS } from '@/core/domain/shop/Shop';

// Packet structure (little-endian, #pragma pack(1)):
//  [1B header=0x26][2B size][1B subheader=0x00]
//  [4B ownerVid]
//  then SHOP_MAX_ITEMS × {
//    vnum:4B  price:4B  count:1B  displayPos:1B
//    sockets[3]:3×4B  bonuses[7]:7×3B (id:1B value:2B)
//  }
//
// Per item: 4+4+1+1+12+21 = 43 bytes
// Total payload: 4 + 40×43 = 1724 bytes
// Total packet: 1 + 2 + 1 + 1724 = 1728 bytes

const SOCKETS_COUNT = 3;
const BONUSES_COUNT = 7;
const ITEM_BYTES = 4 + 4 + 1 + 1 + SOCKETS_COUNT * 4 + BONUSES_COUNT * 3; // 43
const PACKET_SIZE = 1 + 2 + 1 + 4 + SHOP_MAX_ITEMS * ITEM_BYTES; // 1728

export type ShopStartPacketParams = {
    ownerVid: number;
    items?: ShopItem[];
};

export default class ShopStartPacket extends PacketOut {
    private readonly ownerVid: number;
    private readonly items?: ShopItem[];

    constructor({ ownerVid, items }: ShopStartPacketParams) {
        super({ header: PacketHeaderEnum.GC_SHOP, size: PACKET_SIZE, name: 'ShopStartPacket' });
        this.ownerVid = ownerVid;
        this.items = items;
    }

    pack(): Buffer {
        // header already written by BufferWriter constructor (byte 0)
        this.bufferWriter.writeUint16LE(PACKET_SIZE); // size
        this.bufferWriter.writeUint8(ShopSubHeaderGC.START); // subheader
        this.bufferWriter.writeUint32LE(this.ownerVid);

        // Write all 40 item slots; empty slots are zeros
        for (let i = 0; i < SHOP_MAX_ITEMS; i++) {
            const shopItem = this.items?.[i];
            if (shopItem) {
                this.bufferWriter.writeUint32LE(shopItem.vnum);
                this.bufferWriter.writeUint32LE(shopItem.price);
                this.bufferWriter.writeUint8(shopItem.count);
                this.bufferWriter.writeUint8(i); // display_pos = slot index
            } else {
                this.bufferWriter.writeUint32LE(0); // vnum
                this.bufferWriter.writeUint32LE(0); // price
                this.bufferWriter.writeUint8(0); // count
                this.bufferWriter.writeUint8(i); // display_pos (empty but still indexed)
            }

            // Write 3 sockets (all zero for shop items)
            for (let s = 0; s < SOCKETS_COUNT; s++) {
                this.bufferWriter.writeUint32LE(0);
            }

            // Write 7 bonuses (all zero for shop items)
            for (let b = 0; b < BONUSES_COUNT; b++) {
                this.bufferWriter.writeUint8(0); // id
                this.bufferWriter.writeUint16LE(0); // value
            }
        }

        return this.bufferWriter.getBuffer();
    }
}
