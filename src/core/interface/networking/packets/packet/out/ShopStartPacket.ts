import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';
import { ShopSubHeaderGC } from '@/core/enum/ShopSubHeaderEnum';
import { ShopItem } from '@/core/domain/shop/ShopItem';
import Item from '@/core/domain/entities/game/item/Item';
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

        // Never write more entries than the fixed-size buffer can hold, even if
        // the items array somehow grew past the shop grid.
        for (let i = 0; i < Math.min(this.items.length, SHOP_MAX_ITEMS); i++) {
            const shopItem = this.items[i];

            this.bufferWriter.writeUint32LE(shopItem?.vnum || 0);
            this.bufferWriter.writeUint32LE(shopItem?.price || 0);
            this.bufferWriter.writeUint8(shopItem?.count || 0);
            this.bufferWriter.writeUint8(shopItem?.position || 0);

            const item = shopItem?.item instanceof Item ? shopItem.item : undefined;

            const sockets = [item?.getSocket0(), item?.getSocket1(), item?.getSocket2()];
            for (let s = 0; s < SOCKETS_COUNT; s++) {
                this.bufferWriter.writeUint32LE(sockets[s] ?? 0);
            }

            const attributes = [
                [item?.getAttributeType0(), item?.getAttributeValue0()],
                [item?.getAttributeType1(), item?.getAttributeValue1()],
                [item?.getAttributeType2(), item?.getAttributeValue2()],
                [item?.getAttributeType3(), item?.getAttributeValue3()],
                [item?.getAttributeType4(), item?.getAttributeValue4()],
                [item?.getAttributeType5(), item?.getAttributeValue5()],
                [item?.getAttributeType6(), item?.getAttributeValue6()],
            ];
            for (let b = 0; b < BONUSES_COUNT; b++) {
                this.bufferWriter.writeUint8(attributes[b][0] ?? 0); // id
                this.bufferWriter.writeUint16LE(attributes[b][1] ?? 0); // value
            }
        }

        return this.bufferWriter.getBuffer();
    }
}
