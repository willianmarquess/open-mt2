import { expect } from 'chai';
import PrivateShop, { PRIVATE_SHOP_MAX_ITEMS, PRIVATE_SHOP_SIGN_MAX_LEN } from '@/core/domain/shop/PrivateShop';
import { PrivateShopItem } from '@/core/domain/shop/PrivateShop';

const makeItem = (id = 1) =>
    ({
        getId: () => id,
        getCount: () => 1,
        getSize: () => 1,
    }) as any;

const makePlayer = () => ({}) as any;

const makeEntry = (displayPos: number, inventoryPos = 0, price = 100, itemId = 1): PrivateShopItem => ({
    displayPos,
    inventoryPos,
    price,
    item: makeItem(itemId),
});

describe('PrivateShop', () => {
    describe('constructor', () => {
        it('should store sign truncated to PRIVATE_SHOP_SIGN_MAX_LEN', () => {
            const longSign = 'A'.repeat(PRIVATE_SHOP_SIGN_MAX_LEN + 10);
            const shop = new PrivateShop({ owner: makePlayer(), sign: longSign, items: [] });
            expect(shop.getSign()).to.have.lengthOf(PRIVATE_SHOP_SIGN_MAX_LEN);
        });

        it('should store short sign as-is', () => {
            const shop = new PrivateShop({ owner: makePlayer(), sign: 'My Shop', items: [] });
            expect(shop.getSign()).to.equal('My Shop');
        });

        it('should accept up to PRIVATE_SHOP_MAX_ITEMS items', () => {
            const items = Array.from({ length: PRIVATE_SHOP_MAX_ITEMS }, (_, i) => makeEntry(i));
            const shop = new PrivateShop({ owner: makePlayer(), sign: 'S', items });
            expect(shop.getItemsAsArray().filter(Boolean)).to.have.lengthOf(PRIVATE_SHOP_MAX_ITEMS);
        });

        it('should ignore items beyond PRIVATE_SHOP_MAX_ITEMS', () => {
            const items = Array.from({ length: PRIVATE_SHOP_MAX_ITEMS + 5 }, (_, i) => makeEntry(i));
            const shop = new PrivateShop({ owner: makePlayer(), sign: 'S', items });
            expect(shop.getItemsAsArray().filter(Boolean)).to.have.lengthOf(PRIVATE_SHOP_MAX_ITEMS);
        });
    });

    describe('getItemsAsArray', () => {
        it('should return a 40-slot array', () => {
            const shop = new PrivateShop({ owner: makePlayer(), sign: 'S', items: [] });
            expect(shop.getItemsAsArray()).to.have.lengthOf(PRIVATE_SHOP_MAX_ITEMS);
        });

        it('should place items at their displayPos index', () => {
            const shop = new PrivateShop({
                owner: makePlayer(),
                sign: 'S',
                items: [makeEntry(5), makeEntry(20)],
            });
            const arr = shop.getItemsAsArray();
            expect(arr[5]).to.not.be.undefined;
            expect(arr[20]).to.not.be.undefined;
            expect(arr[0]).to.be.undefined;
        });
    });

    describe('getItemAtDisplaySlot', () => {
        it('should return the item at the given slot', () => {
            const entry = makeEntry(3);
            const shop = new PrivateShop({ owner: makePlayer(), sign: 'S', items: [entry] });
            expect(shop.getItemAtDisplaySlot(3)).to.equal(entry);
        });

        it('should return undefined for an empty slot', () => {
            const shop = new PrivateShop({ owner: makePlayer(), sign: 'S', items: [] });
            expect(shop.getItemAtDisplaySlot(0)).to.be.undefined;
        });
    });

    describe('removeItemAtDisplaySlot', () => {
        it('should remove item and return true', () => {
            const shop = new PrivateShop({ owner: makePlayer(), sign: 'S', items: [makeEntry(2)] });
            expect(shop.removeItemAtDisplaySlot(2)).to.be.true;
            expect(shop.getItemAtDisplaySlot(2)).to.be.undefined;
        });

        it('should return false when slot was already empty', () => {
            const shop = new PrivateShop({ owner: makePlayer(), sign: 'S', items: [] });
            expect(shop.removeItemAtDisplaySlot(0)).to.be.false;
        });
    });

    describe('isEmpty', () => {
        it('should return true when no items', () => {
            const shop = new PrivateShop({ owner: makePlayer(), sign: 'S', items: [] });
            expect(shop.isEmpty()).to.be.true;
        });

        it('should return false when items are present', () => {
            const shop = new PrivateShop({ owner: makePlayer(), sign: 'S', items: [makeEntry(0)] });
            expect(shop.isEmpty()).to.be.false;
        });

        it('should become true after all items are removed', () => {
            const shop = new PrivateShop({ owner: makePlayer(), sign: 'S', items: [makeEntry(0)] });
            shop.removeItemAtDisplaySlot(0);
            expect(shop.isEmpty()).to.be.true;
        });
    });

    describe('guest management', () => {
        it('should add and detect a guest', () => {
            const shop = new PrivateShop({ owner: makePlayer(), sign: 'S', items: [] });
            const guest = makePlayer();
            shop.addGuest(guest);
            expect(shop.hasGuest(guest)).to.be.true;
        });

        it('should remove a guest', () => {
            const shop = new PrivateShop({ owner: makePlayer(), sign: 'S', items: [] });
            const guest = makePlayer();
            shop.addGuest(guest);
            shop.removeGuest(guest);
            expect(shop.hasGuest(guest)).to.be.false;
        });

        it('should return all guests', () => {
            const shop = new PrivateShop({ owner: makePlayer(), sign: 'S', items: [] });
            const g1 = makePlayer();
            const g2 = makePlayer();
            shop.addGuest(g1);
            shop.addGuest(g2);
            expect(shop.getGuests().size).to.equal(2);
        });
    });
});
