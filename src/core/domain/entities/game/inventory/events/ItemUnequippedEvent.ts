import { ItemEquipmentSlotEnum } from '@/core/enum/ItemEquipmentSlotEnum';
import Item from '@/core/domain/entities/game/item/Item';
import InventoryEventsEnum from '@/core/domain/entities/game/inventory/events/InventoryEventsEnum';

export default class ItemUnequippedEvent {
    static type = InventoryEventsEnum.ITEM_UNEQUIPPED;
    static getType() {
        return this.type;
    }

    private readonly item: Item;
    private readonly slot: ItemEquipmentSlotEnum;

    constructor({ item, slot }) {
        this.item = item;
        this.slot = slot;
    }

    getItem() {
        return this.item;
    }

    getSlot() {
        return this.slot;
    }
}
