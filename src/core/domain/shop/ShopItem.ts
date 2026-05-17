import Item from '@/core/domain/entities/game/item/Item';

export type ShopItem = {
    vnum: number;
    count: number;
    price: number;
    item: Item;
};
