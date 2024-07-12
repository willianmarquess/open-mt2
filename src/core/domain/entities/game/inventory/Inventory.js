import { EventEmitter } from 'node:events';
import Equipament from './Equipament.js';
import Page from './Page.js';
import ItemEquippedEvent from './events/ItemEquippedEvent.js';
import ItemUnequippedEvent from './events/ItemUnequippedEvent.js';
import ItemEquipamentSlotEnum from '../../../../enum/ItemEquipamentSlotEnum.js';
import WindowTypeEnum from '../../../../enum/WindowTypeEnum.js';

const DEFAULT_INVENTORY_WIDTH = 5;
const DEFAULT_INVENTORY_HEIGHT = 9;

export default class Inventory {
    #pages = [];
    #width = DEFAULT_INVENTORY_WIDTH;
    #height = DEFAULT_INVENTORY_HEIGHT;
    #equipament;
    #emitter = new EventEmitter();

    #items;
    #ownerId;

    constructor({ config, ownerId }) {
        for (let i = 0; i < config.INVENTORY_PAGES; i++) {
            this.#pages.push(new Page(this.#width, this.#height));
        }

        this.#equipament = new Equipament(this.size());
        this.#items = new Map();
        this.#ownerId = ownerId;
    }

    get ownerId() {
        return this.#ownerId;
    }

    get pages() {
        return this.#pages;
    }

    get items() {
        return this.#items;
    }

    size() {
        return this.#width * this.#height * this.#pages.length;
    }

    addItem(item) {
        for (let i = 0; i < this.#pages.length; i++) {
            const page = this.#pages[i];

            var position = page.addItem(item);
            if (position != -1) {
                const realPosition = Math.floor(position + i * this.#width * this.#height);
                item.position = realPosition;
                item.ownerId = this.#ownerId;
                item.window = this.isEquipamentPosition(realPosition)
                    ? WindowTypeEnum.EQUIPMENT
                    : WindowTypeEnum.INVENTORY;
                this.#items.set(item.dbId, item);
                return realPosition;
            }
        }

        return -1;
    }

    addItemAt(item, position) {
        if (this.#isFromEquipamentSlots(position)) {
            this.#equipament.setItem(position, item);
            item.position = position;
            item.ownerId = this.#ownerId;
            item.window = this.isEquipamentPosition(position) ? WindowTypeEnum.EQUIPMENT : WindowTypeEnum.INVENTORY;
            this.#items.set(item.dbId, item);
            this.publish(ItemEquippedEvent.type, new ItemEquippedEvent({ item, slot: position - this.size() }));
            return;
        }

        const page = this.#calcPage(position);
        const pagePosition = this.#calcPagePosition(page, position);
        if (this.#pages[page].addItemAt(item, pagePosition)) {
            item.position = pagePosition;
            item.ownerId = this.#ownerId;
            item.window = this.isEquipamentPosition(pagePosition) ? WindowTypeEnum.EQUIPMENT : WindowTypeEnum.INVENTORY;
            this.#items.set(item.dbId, item);
        }
    }

    #calcPage(position) {
        return Math.floor(position / (this.#width * this.#height));
    }

    #calcPagePosition(page, position) {
        return Math.floor(position - page * this.#width * this.#height);
    }

    #isFromEquipamentSlots(position) {
        return position >= this.size();
    }

    isEquipamentPosition(position) {
        return position >= this.size();
    }

    getItem(position) {
        if (this.#isFromEquipamentSlots(position)) {
            return this.#equipament.getItem(position);
        }

        const page = this.#calcPage(position);
        const pagePosition = this.#calcPagePosition(page, position);
        return this.#pages[page].getItem(pagePosition);
    }

    getItemFromSlot(slot) {
        return this.#equipament.getItem(this.size() + slot);
    }

    removeItem(position, size) {
        const item = this.getItem(position);

        if (!item) return;

        if (this.#isFromEquipamentSlots(position)) {
            const unequippedItem = this.#equipament.removeItem(position);
            this.#items.delete(item.dbId);
            this.publish(
                ItemUnequippedEvent.type,
                new ItemUnequippedEvent({ item: unequippedItem, slot: position - this.size() }),
            );
            return;
        }

        const page = this.#calcPage(position);
        const pagePosition = this.#calcPagePosition(page, position);
        this.#pages[page].removeItem(pagePosition, size);
        this.#items.delete(item.dbId);
    }

    haveAvailablePosition(position, size) {
        if (this.#isFromEquipamentSlots(position)) {
            return this.#equipament.haveAvailableSlot(position);
        }

        const page = this.#calcPage(position);
        const pagePosition = this.#calcPagePosition(page, position);
        return this.#pages[page].haveAvailablePosition(pagePosition, size);
    }

    isValidPosition(position) {
        return position >= 0 && position < this.size() + this.#equipament.size();
    }

    isValidSlot(item, position) {
        return this.#equipament.isValidSlot(item, position);
    }

    getWearPosition(item) {
        return this.#equipament.getWearPosition(item);
    }

    publish(eventName, event) {
        this.#emitter.emit(eventName, event);
    }

    subscribe(eventName, callback) {
        this.#emitter.on(eventName, callback);
    }

    unsubscribe(eventName) {
        this.#emitter.off(eventName);
    }

    getArmorValues() {
        return [
            {
                type: ItemEquipamentSlotEnum.BODY,
                flat: this.#equipament.body?.values[1] ?? 0,
                multi: this.#equipament.body?.values[5] ?? 0,
            },
            {
                type: ItemEquipamentSlotEnum.HEAD,
                flat: this.#equipament.head?.values[1] ?? 0,
                multi: this.#equipament.head?.values[5] ?? 0,
            },
            {
                type: ItemEquipamentSlotEnum.FOOTS,
                flat: this.#equipament.foots?.values[1] ?? 0,
                multi: this.#equipament.foots?.values[5] ?? 0,
            },
            {
                type: ItemEquipamentSlotEnum.SHIELD,
                flat: this.#equipament.shield?.values[1] ?? 0,
                multi: this.#equipament.shield?.values[5] ?? 0,
            },
        ];
    }

    getWeaponValues() {
        return {
            magic: {
                min: this.#equipament.weapon?.values[1] ?? 0,
                max: this.#equipament.weapon?.values[2] ?? 0,
                bonus: this.#equipament.weapon?.values[5] ?? 0,
            },
            physic: {
                min: this.#equipament.weapon?.values[3] ?? 0,
                max: this.#equipament.weapon?.values[4] ?? 0,
                bonus: this.#equipament.weapon?.values[5] ?? 0,
            },
        };
    }
}
