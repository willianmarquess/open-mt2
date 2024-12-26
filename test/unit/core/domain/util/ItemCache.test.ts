import { expect } from 'chai';
import ItemCache from '@/core/domain/util/ItemCache';
import ItemState from '@/core/domain/entities/state/item/ItemState';

describe('ItemCache', () => {
    let itemCache: ItemCache;
    let itemState;

    beforeEach(() => {
        itemCache = new ItemCache();
        itemState = { id: 1, name: 'Test Item' } as unknown as ItemState;
    });

    it('should initialize cache for owner if not present', () => {
        const ownerId = 1;
        const cache = itemCache['get'](ownerId);

        expect(cache).to.have.property('update').that.is.instanceOf(Map);
        expect(cache).to.have.property('delete').that.is.instanceOf(Map);
    });

    it('should check if owner exists in cache', () => {
        const ownerId = 1;
        expect(itemCache.has(ownerId)).to.be.false;

        itemCache.setToUpdate(ownerId, itemState);
        expect(itemCache.has(ownerId)).to.be.true;
    });

    it('should set item to update', () => {
        const ownerId = 1;
        itemCache.setToUpdate(ownerId, itemState);

        const cache = itemCache['get'](ownerId);
        expect(cache.update.has(itemState.id)).to.be.true;
        expect(cache.update.get(itemState.id)).to.equal(itemState);
    });

    it('should set item to delete', () => {
        const ownerId = 1;
        itemCache.setToDelete(ownerId, itemState);

        const cache = itemCache['get'](ownerId);
        expect(cache.delete.has(itemState.id)).to.be.true;
        expect(cache.delete.get(itemState.id)).to.equal(itemState);
    });

    it('should remove item from update cache when set to delete', () => {
        const ownerId = 1;
        itemCache.setToUpdate(ownerId, itemState);
        itemCache.setToDelete(ownerId, itemState);

        const cache = itemCache['get'](ownerId);
        expect(cache.update.has(itemState.id)).to.be.false;
        expect(cache.delete.has(itemState.id)).to.be.true;
    });

    it('should get items to update', () => {
        const ownerId = 1;
        itemCache.setToUpdate(ownerId, itemState);

        const itemsToUpdate = Array.from(itemCache.getItemsToUpdate(ownerId));
        expect(itemsToUpdate).to.include(itemState);
    });
});
