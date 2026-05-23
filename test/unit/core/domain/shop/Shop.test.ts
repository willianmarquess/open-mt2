import { expect } from 'chai';
import type { ShopItem } from '@/core/domain/shop/ShopItem';
import BitFlag from '@/core/util/BitFlag';
import Item from '@/core/domain/entities/game/item/Item';
import { ItemTypeEnum } from '@/core/enum/ItemTypeEnum';
import { ItemUseSubTypeEnum } from '@/core/enum/ItemUseSubTypeEnum';
import Shop from '@/core/domain/shop/Shop';
import { SHOP_GRID_WIDTH } from '@/core/domain/shop/Shop';

function createItem(id: number, size: number, shopPrice = 100) {
    return new Item({
        id,
        name: `item-${id}`,
        type: ItemTypeEnum.ITEM_USE,
        subType: ItemUseSubTypeEnum.USE_POTION,
        size,
        antiFlags: new BitFlag(),
        flags: new BitFlag(),
        wearFlags: new BitFlag(),
        immuneFlags: new BitFlag(),
        gold: 0,
        shopPrice,
        refineId: 0,
        refineSet: 0,
        magicPercent: 0,
        limits: [],
        applies: [],
        values: [],
        specular: 0,
        socket: 0,
        addon: 0,
        count: 1,
        socket0: 0,
        socket1: 0,
        socket2: 0,
        attributeType0: 0,
        attributeValue0: 0,
        attributeType1: 0,
        attributeValue1: 0,
        attributeType2: 0,
        attributeValue2: 0,
        attributeType3: 0,
        attributeValue3: 0,
        attributeType4: 0,
        attributeValue4: 0,
        attributeType5: 0,
        attributeValue5: 0,
        attributeType6: 0,
        attributeValue6: 0,
        dbId: null,
    });
}

describe('Shop', () => {
    it('should allocate shop items in grid positions respecting item size', () => {
        const item1 = createItem(1, 1);
        const item2 = createItem(2, 2);
        const item3 = createItem(3, 3);

        const shop = new Shop({
            npcVnum: 9001,
            shopName: 'Grid Shop',
            items: [
                { vnum: 1000, count: 1, price: item1.getShopPrice(), item: item1, size: item1.getSize(), position: -1 },
                { vnum: 1001, count: 1, price: item2.getShopPrice(), item: item2, size: item2.getSize(), position: -1 },
                { vnum: 1002, count: 1, price: item3.getShopPrice(), item: item3, size: item3.getSize(), position: -1 },
            ],
        });

        const placedItems = shop.getItems().filter((item): item is ShopItem => Boolean(item));

        expect(placedItems.length).to.equal(3);
        expect(placedItems.map((item) => item.position)).to.deep.equal([0, 1, 2]);
        expect(shop.getItem(0)?.item).to.equal(item1);
        expect(shop.getItem(1)?.item).to.equal(item2);
        expect(shop.getItem(6)?.item).to.equal(item2);
        expect(shop.getItem(2)?.item).to.equal(item3);
        expect(shop.getItem(7)?.item).to.equal(item3);
        expect(shop.getItem(12)?.item).to.equal(item3);
    });

    it('should allocate the next available positions for shop items when explicit positions are ignored', () => {
        const item1 = createItem(4, 2);
        const item2 = createItem(5, 1);

        const shop = new Shop({
            npcVnum: 9002,
            shopName: 'Explicit Shop',
            items: [
                {
                    vnum: 2000,
                    count: 1,
                    price: item1.getShopPrice(),
                    item: item1,
                    size: item1.getSize(),
                    position: SHOP_GRID_WIDTH - 1,
                },
                { vnum: 2001, count: 1, price: item2.getShopPrice(), item: item2, size: item2.getSize(), position: -1 },
            ],
        });

        const placedItems = shop.getItems().filter((item): item is ShopItem => Boolean(item));

        expect(placedItems.find((item) => item.vnum === 2000)?.position).to.equal(0);
        expect(shop.getItem(0)?.item).to.equal(item1);
        expect(shop.getItem(SHOP_GRID_WIDTH)?.item).to.equal(item1);
        expect(shop.getItem(1)?.item).to.equal(item2);
    });
});
