import { expect } from 'chai';
import Shop from '@/core/domain/shop/Shop';
import { ShopItem } from '@/core/domain/shop/ShopItem';

describe('Shop', () => {
    let shop: Shop;

    beforeEach(() => {
        const items: ShopItem[] = [
            { vnum: 1000, count: 1, price: 100, item: undefined },
            { vnum: 1010, count: 1, price: 200, item: undefined },
            { vnum: 2000, count: 5, price: 500, item: undefined },
        ];
        shop = new Shop({ npcVnum: 9001, shopName: 'Arms', items });
    });

    it('should initialize with correct vnum and name', () => {
        expect(shop.getNpcVnum()).to.equal(9001);
        expect(shop.getShopName()).to.equal('Arms');
    });

    it('should initialize with items', () => {
        const items = shop.getItems();
        expect(items.length).to.equal(3);
        expect(items[0].vnum).to.equal(1000);
        expect(items[0].count).to.equal(1);
    });

    it('should have max 40 items', () => {
        expect(shop.getItems().length).to.be.at.most(40);
    });

    it('should return all items', () => {
        const allItems = shop.getItems();
        expect(allItems.length).to.equal(3);
    });

    it('should get item at specific slot', () => {
        const item = shop.getItemAtSlot(0);
        expect(item).to.not.be.undefined;
        expect(item.vnum).to.equal(1000);
    });

    it('should return undefined for invalid slot', () => {
        const item = shop.getItemAtSlot(100);
        expect(item).to.be.undefined;
    });

    it('should return slot count', () => {
        expect(shop.getSlotCount()).to.equal(3);
    });

    it('should limit items to SHOP_MAX_ITEMS on construction', () => {
        // Create a shop with more than 40 items
        const manyItems: ShopItem[] = [];
        for (let i = 0; i < 50; i++) {
            manyItems.push({ vnum: 1000 + i, count: 1, price: 100, item: undefined });
        }

        const limitedShop = new Shop({ npcVnum: 9002, shopName: 'Test', items: manyItems });
        expect(limitedShop.getSlotCount()).to.equal(40);
    });
});
