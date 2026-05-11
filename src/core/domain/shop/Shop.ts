import { ShopItem } from './ShopItem';

export const SHOP_MAX_ITEMS = 40;

export default class Shop {
    private readonly npcVnum: number;
    private readonly shopName: string;
    private readonly items: ShopItem[];

    constructor({ npcVnum, shopName, items }: { npcVnum: number; shopName: string; items: ShopItem[] }) {
        this.npcVnum = npcVnum;
        this.shopName = shopName;
        this.items = items.slice(0, SHOP_MAX_ITEMS);
    }

    getNpcVnum() {
        return this.npcVnum;
    }

    getShopName() {
        return this.shopName;
    }

    getItems(): ShopItem[] {
        return this.items;
    }

    getItemAtSlot(pos: number): ShopItem | undefined {
        return this.items[pos];
    }

    getSlotCount() {
        return this.items.length;
    }
}
