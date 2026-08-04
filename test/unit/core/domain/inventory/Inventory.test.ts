import { expect } from 'chai';
import BitFlag from '@/core/util/BitFlag';
import Item from '@/core/domain/entities/game/item/Item';
import Inventory from '@/core/domain/entities/game/inventory/Inventory';
import { ItemTypeEnum } from '@/core/enum/ItemTypeEnum';
import { ItemUseSubTypeEnum } from '@/core/enum/ItemUseSubTypeEnum';
import { GameConfig } from '@/game/infra/config/GameConfig';

const PAGE_SIZE = 45; // 5 x 9

function createItem(id: number, dbId: number | null, size: number = 1) {
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

    it('should resolve a multi-cell item only at its anchor cell', () => {
        const inventory = createInventory();
        const item = createItem(11299, 1, 2);

        inventory.addItemAt(item, 0);

        expect(inventory.getItem(0)).to.equal(item);
        expect(inventory.getItem(5)).to.equal(null);
    });

    it('should ignore a removal addressed by a cell that is not the anchor', () => {
        const inventory = createInventory();
        const item = createItem(11299, 1, 2);

        inventory.addItemAt(item, 0);

        inventory.removeItem(5, item.getSize());

        expect(inventory.getItem(0)).to.equal(item);
        expect(inventory.getItems().size).to.equal(1);
        expect(inventory.haveAvailablePosition(5, 1)).to.equal(false);
    });

    it('should not clear a neighbour when a non-anchor cell is removed', () => {
        const inventory = createInventory();
        const item = createItem(11299, 1, 2);
        const neighbour = createItem(27003, 2);

        inventory.addItemAt(item, 0);
        inventory.addItemAt(neighbour, 10);

        inventory.removeItem(5, item.getSize());

        expect(inventory.getItem(10)).to.equal(neighbour);
    });

    it('should keep every cell of a multi-cell item occupied', () => {
        const inventory = createInventory();
        const item = createItem(11299, 1, 2);

        inventory.addItemAt(item, 0);

        expect(inventory.haveAvailablePosition(0, 1)).to.equal(false);
        expect(inventory.haveAvailablePosition(5, 1)).to.equal(false);
        expect(inventory.haveAvailablePosition(10, 1)).to.equal(true);
    });

    it('should refuse to place an item over the non-anchor cell of a multi-cell item', () => {
        const inventory = createInventory();
        const item = createItem(11299, 1, 2);
        const other = createItem(27003, 2);

        inventory.addItemAt(item, 0);
        inventory.addItemAt(other, 5);

        expect(inventory.getItem(0)).to.equal(item);
        expect(other.getPosition()).to.equal(null);
    });

    it('should free every cell when a multi-cell item is removed from its anchor', () => {
        const inventory = createInventory();
        const item = createItem(11299, 1, 2);

        inventory.addItemAt(item, 0);
        inventory.removeItem(0, item.getSize());

        expect(inventory.getItem(0)).to.equal(null);
        expect(inventory.haveAvailablePosition(0, 2)).to.equal(true);
    });
});

describe('Inventory items collection (issue #118)', () => {
    it('should keep every item added before its database insert, not just the last', () => {
        const inventory = createInventory();
        const first = createItem(27003, null);
        const second = createItem(27004, null);

        inventory.addItem(first);
        inventory.addItem(second);

        const listed = [...inventory.getItems().values()];
        expect(listed, 'both fresh items were filed under one key, so the second evicted the first').to.have.members([
            first,
            second,
        ]);
    });

    it('should keep an item placed at a fixed position before its database insert', () => {
        const inventory = createInventory();
        const first = createItem(27003, null);
        const second = createItem(27004, null);

        inventory.addItemAt(first, 0);
        inventory.addItemAt(second, 1);

        expect([...inventory.getItems().values()]).to.have.members([first, second]);
    });

    it('should still list an item after it gains its database id', () => {
        const inventory = createInventory();
        const item = createItem(27003, null);

        inventory.addItem(item);
        item.setDbId(4242);

        expect([...inventory.getItems().values()]).to.have.members([item]);
    });

    it('should drop exactly the removed instance and keep the other fresh item', () => {
        const inventory = createInventory();
        const first = createItem(27003, null);
        const second = createItem(27004, null);

        inventory.addItemAt(first, 0);
        inventory.addItemAt(second, 1);
        inventory.removeItem(0, 1);

        expect([...inventory.getItems().values()]).to.have.members([second]);
    });

    it('should drop an unequipped fresh item from the collection', () => {
        const inventory = createInventory();
        const armor = createItem(11299, null, 2);
        const equipmentSlot = inventory.size() + 1;

        inventory.addItemAt(armor, equipmentSlot);
        inventory.removeItem(equipmentSlot, 1);

        expect([...inventory.getItems().values()]).to.deep.equal([]);
    });
});
