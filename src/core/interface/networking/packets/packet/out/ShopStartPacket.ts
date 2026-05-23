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

        for (let i = 0; i < this.items.length; i++) {
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
