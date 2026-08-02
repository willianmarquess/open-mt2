import ItemState from '../entities/state/item/ItemState';

export default class ItemCache {
    readonly cache: Map<number, { update: Map<number, ItemState>; delete: Map<number, ItemState> }> = new Map();

    private get(ownerId: number) {
        if (!this.cache.has(ownerId)) {
            this.cache.set(ownerId, {
                update: new Map(),
                delete: new Map(),
            });
        }
        return this.cache.get(ownerId)!;
    }

    has(ownerId: number) {
        return this.cache.has(ownerId);
    }

    setToUpdate(ownerId: number, item: ItemState) {
        const cache = this.get(ownerId);
        cache?.update.set(item.id, item);
    }

    setToDelete(ownerId: number, item: ItemState) {
        const cache = this.get(ownerId);
        if (cache?.update.has(item.id)) {
            cache.update.delete(item.id);
        }
        cache?.delete.set(item.id, item);
    }

    getItemsToUpdate(ownerId: number) {
        const cache = this.get(ownerId);
        return cache.update.values();
    }

    getItemsToDelete(ownerId: number) {
        const cache = this.get(ownerId);
        return cache.delete.values();
    }

    drain(ownerId: number) {
        const cache = this.get(ownerId);
        const drained = { update: [...cache.update.values()], delete: [...cache.delete.values()] };
        cache.update.clear();
        cache.delete.clear();
        return drained;
    }

    restore(ownerId: number, drained: { update: Array<ItemState>; delete: Array<ItemState> }) {
        const cache = this.get(ownerId);

        for (const item of drained.update) {
            if (!cache.update.has(item.id) && !cache.delete.has(item.id)) cache.update.set(item.id, item);
        }

        for (const item of drained.delete) {
            if (!cache.delete.has(item.id)) cache.delete.set(item.id, item);
        }
    }

    clear(ownerId: number) {
        const cache = this.get(ownerId);
        cache?.update.clear();
        cache?.delete.clear();
    }
}
