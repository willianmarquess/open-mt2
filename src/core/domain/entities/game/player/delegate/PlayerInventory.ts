import { ChatMessageTypeEnum } from "@/core/enum/ChatMessageTypeEnum";
import Item from "../../item/Item";
import ItemAddedEvent from "../events/ItemAddedEvent";
import ItemRemovedEvent from "../events/ItemRemovedEvent";
import Player from "../Player";
import { WindowTypeEnum } from "@/core/enum/WindowTypeEnum";
import { ItemEquipmentSlotEnum } from "@/core/enum/ItemEquipmentSlotEnum";

export default class PlayerInventory {
    private player: Player;

    constructor(player: Player) {
        this.player = player;
    }

    sendItemAdded(window: number, position: number, item: Item) {
        this.player.publish(
            ItemAddedEvent.type,
            new ItemAddedEvent({
                window,
                position,
                id: item.getId(),
                count: item.getCount() ?? 1,
                flags: item.getFlags().getFlag(),
                antiFlags: item.getAntiFlags().getFlag(),
                highlight: 0,
                bonuses: 0,
                sockets: 0
            }),
        );
    }

    sendItemRemoved({ window, position }) {
        this.player.publish(
            ItemRemovedEvent.type,
            new ItemRemovedEvent({
                window,
                position,
            }),
        );
    }

    getItem(position: number) {
        return this.player.getInventory().getItem(Number(position));
    }

    isWearable(item: Item) {
        return (
            this.player.getLevel() >= item.getLevelLimit() &&
            item.getWearFlags().getFlag() > 0 &&
            !item.getAntiFlags().is(this.player.antiFlagClass) &&
            !item.getAntiFlags().is(this.player.antiFlagGender)
        );
    }

    moveItem({ fromWindow, fromPosition, toWindow, toPosition /*_count*/ }) {
        const item = this.getItem(fromPosition);

        if (!item) return;
        if (fromWindow !== WindowTypeEnum.INVENTORY || toWindow !== WindowTypeEnum.INVENTORY) return;
        if (!this.player.getInventory().isValidPosition(toPosition)) return;
        if (!this.player.getInventory().haveAvailablePosition(toPosition, item.getSize())) return;

        if (this.player.getInventory().isEquipmentPosition(toPosition)) {
            if (!this.isWearable(item)) return;
            if (!this.player.getInventory().isValidSlot(item, toPosition)) return;
        }

        this.player.getInventory().removeItem(fromPosition, item.getSize());
        this.player.getInventory().addItemAt(item, toPosition);

        this.sendItemRemoved({
            window: fromWindow,
            position: fromPosition,
        });
        this.sendItemAdded(
            toWindow,
            toPosition,
            item,
        );

        return item;
    }

    addItem(item: Item) {
        const position = this.player.getInventory().addItem(item);

        if (position < 0) {
            this.player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: 'Inventory is full',
            });
            return false;
        }

        this.sendItemAdded(
            WindowTypeEnum.INVENTORY,
            position,
            item,
        );

        return true;
    }

    sendInventory() {
        for (const item of this.player.getInventory().getItems().values()) {
            this.sendItemAdded(
                item.getWindow(),
                item.getPosition(),
                item,
            );
        }
        this.player.updateView();
    }

    getBody() {
        return this.player.getInventory().getItemFromSlot(ItemEquipmentSlotEnum.BODY);
    }

    getWeapon() {
        return this.player.getInventory().getItemFromSlot(ItemEquipmentSlotEnum.WEAPON);
    }

    getHair() {
        return this.player.getInventory().getItemFromSlot(ItemEquipmentSlotEnum.COSTUME_HAIR);
    }
}
