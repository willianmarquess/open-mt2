import { expect } from 'chai';
import BitFlag from '@/core/util/BitFlag';
import Item from '@/core/domain/entities/game/item/Item';
import Inventory from '@/core/domain/entities/game/inventory/Inventory';
import { ItemTypeEnum } from '@/core/enum/ItemTypeEnum';
import { ItemUseSubTypeEnum } from '@/core/enum/ItemUseSubTypeEnum';
import { GameConfig } from '@/game/infra/config/GameConfig';

const PAGE_SIZE = 45; // 5 x 9

function createItem(id: number, dbId: number) {
    return new Item({
        id,
        name: `item-${id}`,
        type: ItemTypeEnum.ITEM_USE,
        subType: ItemUseSubTypeEnum.USE_POTION,
        size: 1,
        antiFlags: new BitFlag(),
        flags: new BitFlag(),
        wearFlags: new BitFlag(),
        immuneFlags: new BitFlag(),
        gold: 0,
        shopPrice: 100,
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
        dbId,
    });
}

function createInventory() {
    return new Inventory({ config: { INVENTORY_PAGES: 2 } as GameConfig, ownerId: 1 });
}

describe('Inventory', () => {
    it('should keep the absolute position when placing an item on the first page', () => {
        const inventory = createInventory();
        const item = createItem(27003, 1);

        inventory.addItemAt(item, 10);

        expect(item.getPosition()).to.equal(10);
        expect(inventory.getItem(10)).to.equal(item);
    });

    it('should keep the absolute position when placing an item on the second page', () => {
        const inventory = createInventory();
        const item = createItem(27003, 1);

        const secondPagePosition = PAGE_SIZE + 25;
        inventory.addItemAt(item, secondPagePosition);

        expect(item.getPosition()).to.equal(secondPagePosition);
        expect(inventory.getItem(secondPagePosition)).to.equal(item);
    });

    it('should not collide first-page items with reloaded second-page items', () => {
        const inventory = createInventory();
        const firstPageItem = createItem(27003, 1);
        const secondPageItem = createItem(27004, 2);

        // Same page-relative slot on both pages, as when the inventory is
        // rebuilt from the database on login.
        inventory.addItemAt(firstPageItem, 25);
        inventory.addItemAt(secondPageItem, PAGE_SIZE + 25);

        expect(inventory.getItem(25)).to.equal(firstPageItem);
        expect(inventory.getItem(PAGE_SIZE + 25)).to.equal(secondPageItem);
        expect(firstPageItem.getPosition()).to.equal(25);
        expect(secondPageItem.getPosition()).to.equal(PAGE_SIZE + 25);
    });
});
