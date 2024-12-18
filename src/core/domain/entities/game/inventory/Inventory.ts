import { EventEmitter } from 'node:events';
import Page from '@/core/domain/entities/game/inventory/Page';
import Equipment from '@/core/domain/entities/game/inventory/Equipment';
import Item from '@/core/domain/entities/game/item/Item';
import { WindowTypeEnum } from '@/core/enum/WindowTypeEnum';
import { ItemEquipmentSlotEnum } from '@/core/enum/ItemEquipmentSlotEnum';
import ItemEquippedEvent from '@/core/domain/entities/game/inventory/events/ItemEquippedEvent';
import ItemUnequippedEvent from '@/core/domain/entities/game/inventory/events/ItemUnequippedEvent';

const DEFAULT_INVENTORY_WIDTH = 5;
const DEFAULT_INVENTORY_HEIGHT = 9;

export default class Inventory {
    private pages: Array<Page> = [];
    private width = DEFAULT_INVENTORY_WIDTH;
    private height = DEFAULT_INVENTORY_HEIGHT;
    private equipment: Equipment;
    private emitter = new EventEmitter();

    private items: Map<number, Item>;
    private ownerId: number;

    constructor({ config, ownerId }) {
        for (let i = 0; i < config.INVENTORY_PAGES; i++) {
            this.pages.push(new Page(this.width, this.height));
        }

        this.equipment = new Equipment(this.size());
        this.items = new Map<number, Item>();
        this.ownerId = ownerId;
    }

    getOwnerId() {
        return this.ownerId;
    }

    getPages() {
        return this.pages;
    }

    getItems() {
        return this.items;
    }

    size() {
        return this.width * this.height * this.pages.length;
    }

    addItem(item) {
        for (let i = 0; i < this.pages.length; i++) {
            const page = this.pages[i];

            const position = page.addItem(item);
            if (position != -1) {
                const realPosition = Math.floor(position + i * this.width * this.height);
                item.position = realPosition;
                item.ownerId = this.ownerId;
                item.window = this.isEquipmentPosition(realPosition)
                    ? WindowTypeEnum.EQUIPMENT
                    : WindowTypeEnum.INVENTORY;
                this.items.set(item.dbId, item);
                return realPosition;
            }
        }

        return -1;
    }

    addItemAt(item: Item, position: number) {
        if (this.isFromEquipmentSlots(position)) {
            this.equipment.setItem(position, item);
            item.setPosition(position);
            item.setOwnerId(this.ownerId);
            item.setWindow(this.isEquipmentPosition(position) ? WindowTypeEnum.EQUIPMENT : WindowTypeEnum.INVENTORY);
            this.items.set(item.getDbId(), item);
            this.publish(ItemEquippedEvent.type, new ItemEquippedEvent({ item, slot: position - this.size() }));
            return;
        }

        const page = this.calcPage(position);
        const pagePosition = this.calcPagePosition(page, position);
        if (this.pages[page].addItemAt(item, pagePosition)) {
            item.setPosition(pagePosition);
            item.setOwnerId(this.ownerId);
            item.setWindow(
                this.isEquipmentPosition(pagePosition) ? WindowTypeEnum.EQUIPMENT : WindowTypeEnum.INVENTORY,
            );
            this.items.set(item.getDbId(), item);
        }
    }

    calcPage(position: number) {
        return Math.floor(position / (this.width * this.height));
    }

    calcPagePosition(page: number, position: number) {
        return Math.floor(position - page * this.width * this.height);
    }

    isFromEquipmentSlots(position: number) {
        return position >= this.size();
    }

    isEquipmentPosition(position: number) {
        return position >= this.size();
    }

    getItem(position: number) {
        if (this.isFromEquipmentSlots(position)) {
            return this.equipment.getItem(position);
        }

        const page = this.calcPage(position);
        const pagePosition = this.calcPagePosition(page, position);
        return this.pages[page].getItem(pagePosition);
    }

    getItemFromSlot(slot: number) {
        return this.equipment.getItem(this.size() + slot);
    }

    removeItem(position: number, size: number) {
        const item = this.getItem(position);

        if (!item) return;

        if (this.isFromEquipmentSlots(position)) {
            const unequippedItem = this.equipment.removeItem(position);
            this.items.delete(item.getDbId());
            this.publish(
                ItemUnequippedEvent.type,
                new ItemUnequippedEvent({ item: unequippedItem, slot: position - this.size() }),
            );
            return;
        }

        const page = this.calcPage(position);
        const pagePosition = this.calcPagePosition(page, position);
        this.pages[page].removeItem(pagePosition, size);
        this.items.delete(item.getDbId());
    }

    haveAvailablePosition(position: number, size: number) {
        if (this.isFromEquipmentSlots(position)) {
            return this.equipment.haveAvailableSlot(position);
        }

        const page = this.calcPage(position);
        const pagePosition = this.calcPagePosition(page, position);
        return this.pages[page].haveAvailablePosition(pagePosition, size);
    }

    isValidPosition(position) {
        return position >= 0 && position < this.size() + this.equipment.size();
    }

    isValidSlot(item: Item, position: number) {
        return this.equipment.isValidSlot(item, position);
    }

    getWearPosition(item: Item) {
        return this.equipment.getWearPosition(item);
    }

    publish(eventName, event) {
        this.emitter.emit(eventName, event);
    }

    subscribe(eventName, callback) {
        this.emitter.on(eventName, callback);
    }

    getArmorValues() {
        return [
            {
                type: ItemEquipmentSlotEnum.BODY,
                flat: this.equipment.getBody()?.getValues()[1] ?? 0,
                multi: this.equipment.getBody()?.getValues()[5] ?? 0,
            },
            {
                type: ItemEquipmentSlotEnum.HEAD,
                flat: this.equipment.getHead()?.getValues()[1] ?? 0,
                multi: this.equipment.getHead()?.getValues()[5] ?? 0,
            },
            {
                type: ItemEquipmentSlotEnum.FOOTS,
                flat: this.equipment.getFoots()?.getValues()[1] ?? 0,
                multi: this.equipment.getFoots()?.getValues()[5] ?? 0,
            },
            {
                type: ItemEquipmentSlotEnum.SHIELD,
                flat: this.equipment.getShield()?.getValues()[1] ?? 0,
                multi: this.equipment.getShield()?.getValues()[5] ?? 0,
            },
        ];
    }

    getWeaponValues() {
        return {
            magic: {
                min: this.equipment.getWeapon()?.getValues()[1] ?? 0,
                max: this.equipment.getWeapon()?.getValues()[2] ?? 0,
                bonus: this.equipment.getWeapon()?.getValues()[5] ?? 0,
            },
            physic: {
                min: this.equipment.getWeapon()?.getValues()[3] ?? 0,
                max: this.equipment.getWeapon()?.getValues()[4] ?? 0,
                bonus: this.equipment.getWeapon()?.getValues()[5] ?? 0,
            },
        };
    }
}
