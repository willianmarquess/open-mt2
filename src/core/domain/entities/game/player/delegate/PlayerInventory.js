import ChatMessageTypeEnum from '../../../../../enum/ChatMessageTypeEnum.js';
import ItemEquipmentSlotEnum from '../../../../../enum/ItemEquipmentSlotEnum.js';
import WindowTypeEnum from '../../../../../enum/WindowTypeEnum.js';
import ItemAddedEvent from '../events/ItemAddedEvent.js';
import ItemDroppedEvent from '../events/ItemDroppedEvent.js';
import ItemDroppedHideEvent from '../events/ItemDroppedHideEvent.js';
import ItemRemovedEvent from '../events/ItemRemovedEvent.js';

export default class PlayerInventory {
    #player;

    constructor(player) {
        this.#player = player;
    }

    sendItemAdded({ window, position, item }) {
        this.#player.publish(
            ItemAddedEvent.type,
            new ItemAddedEvent({
                window,
                position,
                id: item.id,
                count: item.count ?? 1,
                flags: item.flags.flag,
                antiFlags: item.antiFlags.flag,
                highlight: 0,
            }),
        );
    }

    sendItemRemoved({ window, position }) {
        this.#player.publish(
            ItemRemovedEvent.type,
            new ItemRemovedEvent({
                window,
                position,
            }),
        );
    }

    getItem(position) {
        return this.#player.inventory.getItem(Number(position));
    }

    isWearable(item) {
        return (
            this.#player.level >= item.getLevelLimit() &&
            item.wearFlags.flag > 0 &&
            !item.antiFlags.is(this.#player.antiFlagClass) &&
            !item.antiFlags.is(this.#player.antiFlagGender)
        );
    }

    moveItem({ fromWindow, fromPosition, toWindow, toPosition /*_count*/ }) {
        const item = this.getItem(fromPosition);

        if (!item) return;
        if (fromWindow !== WindowTypeEnum.INVENTORY || toWindow !== WindowTypeEnum.INVENTORY) return;
        if (!this.#player.inventory.isValidPosition(toPosition)) return;
        if (!this.#player.inventory.haveAvailablePosition(toPosition, item.size)) return;

        if (this.#player.inventory.isEquipmentPosition(toPosition)) {
            if (!this.isWearable(item)) return;
            if (!this.#player.inventory.isValidSlot(item, toPosition)) return;
        }

        this.#player.inventory.removeItem(fromPosition, item.size);
        this.#player.inventory.addItemAt(item, toPosition);

        this.sendItemRemoved({
            window: fromWindow,
            position: fromPosition,
        });
        this.sendItemAdded({
            window: toWindow,
            position: toPosition,
            item,
        });

        return item;
    }

    addItem(item) {
        const position = this.#player.inventory.addItem(item);

        if (position < 0) {
            this.#player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: 'Inventory is full',
            });
            return false;
        }

        this.sendItemAdded({
            window: WindowTypeEnum.INVENTORY,
            position,
            item,
        });

        return true;
    }

    sendInventory() {
        for (const item of this.#player.inventory.items.values()) {
            this.sendItemAdded({
                window: item.window,
                position: item.position,
                item,
            });
        }
        this.#player.updateView();
    }

    showDroppedItem({ virtualId, count, positionX, positionY, ownerName, id }) {
        this.#player.publish(
            ItemDroppedEvent.type,
            new ItemDroppedEvent({
                virtualId,
                count,
                positionX,
                positionY,
                ownerName,
                id,
            }),
        );
    }

    hideDroppedItem({ virtualId }) {
        this.#player.publish(
            ItemDroppedHideEvent.type,
            new ItemDroppedHideEvent({
                virtualId,
            }),
        );
    }

    getBody() {
        return this.#player.inventory.getItemFromSlot(ItemEquipmentSlotEnum.BODY);
    }

    getWeapon() {
        return this.#player.inventory.getItemFromSlot(ItemEquipmentSlotEnum.WEAPON);
    }

    getHair() {
        return this.#player.inventory.getItemFromSlot(ItemEquipmentSlotEnum.COSTUME_HAIR);
    }
}
