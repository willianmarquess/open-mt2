import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';
import { ShopSubHeaderGC } from '@/core/enum/ShopSubHeaderEnum';
import { ShopItem } from '@/core/domain/shop/ShopItem';
import { SHOP_MAX_ITEMS } from '@/core/domain/shop/Shop';

const SOCKETS_COUNT = 3;
const BONUSES_COUNT = 7;
const ITEM_BYTES = 4 + 4 + 1 + 1 + SOCKETS_COUNT * 4 + BONUSES_COUNT * 3; // 43
const PACKET_SIZE = 1 + 2 + 1 + 4 + SHOP_MAX_ITEMS * ITEM_BYTES; // 1728

export type ShopStartPacketParams = {
    ownerVid: number;
    items: Array<ShopItem | undefined>;
};

/**
 * @packet
 * @type Out
 * @name ShopStartPacket
 * @header 0x26
 * @size 1728
 * @description Is used to open the shop window with its full item grid (we need to repeat the item block 40x, empty slots are sent zeroed). Matches TPacketGCShop + owner vid + TPacketGCShopStart.
 * @fields
 *   - {byte} header 1 Packet header.
 *   - {short} size 2 Total packet size in bytes, including the header.
 *   - {byte} subheader 1 Shop subheader, always START (0). See ShopSubHeaderGC.
 *   - {int} ownerVid 4 Virtual id of the shop owner (npc or player).
 *   - {int} vnum 4 Item vnum of this shop slot, 0 when the slot is empty.
 *   - {int} price 4 Price of the item in yang.
 *   - {byte} count 1 Item stack count.
 *   - {byte} displayPos 1 Slot position of the item inside the shop grid.
 *   - {int[3]} sockets 12 Three socket values, always 0 for shop items.
 *   - {bonus[7]} bonuses 21 Seven attribute slots, each one a {byte} id plus a {short} value, always 0 for shop items.
 */

export default class ShopStartPacket extends PacketOut {
    private readonly ownerVid: number;
    private readonly items: Array<ShopItem | undefined>;

    constructor({ ownerVid, items }: ShopStartPacketParams) {
        super({ header: PacketHeaderEnum.SHOP_OUT, size: PACKET_SIZE, name: 'ShopStartPacket' });
        this.ownerVid = ownerVid;
        this.items = items;
    }

    pack(): Buffer {
        this.bufferWriter.writeUint16LE(PACKET_SIZE); // size
        this.bufferWriter.writeUint8(ShopSubHeaderGC.START); // subheader
        this.bufferWriter.writeUint32LE(this.ownerVid);

        // Never write more entries than the fixed-size buffer can hold, even if
        // the items array somehow grew past the shop grid.
        for (let i = 0; i < Math.min(this.items.length, SHOP_MAX_ITEMS); i++) {
            const shopItem = this.items[i];

            this.bufferWriter.writeUint32LE(shopItem?.vnum || 0);
            this.bufferWriter.writeUint32LE(shopItem?.price || 0);
            this.bufferWriter.writeUint8(shopItem?.count || 0);
            this.bufferWriter.writeUint8(shopItem?.position || 0);

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
