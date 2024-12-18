import ItemDTO from '@/core/domain/dto/ItemDTO';

export default class ItemCache {
    cache: Map<number, { update: Map<number, ItemDTO>; delete: Map<number, ItemDTO> }> = new Map();

    private get(ownerId: number) {
        if (!this.cache.has(ownerId)) {
            this.cache.set(ownerId, {
                update: new Map(),
                delete: new Map(),
            });
        }
        return this.cache.get(ownerId);
    }

    has(ownerId: number) {
        return this.cache.has(ownerId);
    }

    setToUpdate(ownerId: number, item: ItemDTO) {
        const cache = this.get(ownerId);
        cache.update.set(item.id, item);
    }

    setToDelete(ownerId: number, item: ItemDTO) {
        const cache = this.get(ownerId);
        if (cache.update.has(item.id)) {
            cache.update.delete(item.id);
        }
        cache.delete.set(item.id, item);
    }

    getItemsToUpdate(ownerId: number) {
        const cache = this.get(ownerId);
        return cache.update.values();
    }

    getItemsToDelete(ownerId: number) {
        const cache = this.get(ownerId);
        return cache.delete.values();
    }

    clear(ownerId: number) {
        const cache = this.get(ownerId);
        cache.update.clear();
        cache.delete.clear();
    }
}
