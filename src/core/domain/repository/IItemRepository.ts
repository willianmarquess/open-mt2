import ItemState from '@/core/domain/entities/state/item/ItemState';

export interface IItemRepository {
    delete(item: ItemState): Promise<void>;
    update(item: ItemState): Promise<void>;
    create(item: ItemState): Promise<number>;
    getByOwner(ownerId: number): Promise<ItemState[]>;
}
