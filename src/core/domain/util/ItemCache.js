export default class ItemCache {
    #cache = new Map();

    get(ownerId) {
        if (!this.#cache.has(ownerId)) {
            this.#cache.set(ownerId, {
                update: new Map(),
                delete: new Map(),
            });
        }
        return this.#cache.get(ownerId);
    }

    has(ownerId) {
        return this.#cache.has(ownerId);
    }

    setToUpdate(ownerId, item) {
        const cache = this.get(ownerId);
        cache.update.set(item.id, item);
    }

    setToDelete(ownerId, item) {
        const cache = this.get(ownerId);
        if (cache.update.has(item.id)) {
            cache.update.delete(item.id);
        }
        cache.delete.set(item.id, item);
    }

    getItemsToUpdate(ownerId) {
        const cache = this.get(ownerId);
        return cache.update.values();
    }

    getItemsToDelete(ownerId) {
        const cache = this.get(ownerId);
        return cache.delete.values();
    }

    clear(ownerId) {
        const cache = this.get(ownerId);
        cache.update.clear();
        cache.delete.clear();
    }
}
