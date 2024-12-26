import Item from '@/core/domain/entities/game/item/Item';
import Player from '@/core/domain/entities/game/player/Player';
import ItemManager from '@/core/domain/manager/ItemManager';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { WindowTypeEnum } from '@/core/enum/WindowTypeEnum';
import Logger from '@/core/infra/logger/Logger';

export default class UseItemService {
    private logger: Logger;
    private itemManager: ItemManager;

    constructor({ logger, itemManager }) {
        this.logger = logger;
        this.itemManager = itemManager;
    }

    async execute(player: Player, window: number, position: number) {
        this.logger.debug(`[UseItemService] using item in window: ${window}, position: ${position}`);

        const item = player.getItem(position);

        if (!item) return;

        if (player.isWearable(item)) {
            await this.useWearableItem(player, item, position, window);
        } else {
            await this.useNonWearableItem();
        }
    }

    private async useWearableItem(player: Player, item: Item, position: number, window: number) {
        if (player.getInventory().isEquipmentPosition(position)) {
            player.getInventory().removeItem(position, item.getSize());
            const addedPosition = player.getInventory().addItem(item);

            if (addedPosition >= 0) {
                player.sendItemRemoved({
                    window,
                    position,
                });

                player.sendItemAdded({
                    window: WindowTypeEnum.INVENTORY,
                    position: addedPosition,
                    item,
                });

                await this.itemManager.update(item);
            } else {
                player.chat({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: 'Inventory is full',
                });
                player.getInventory().addItemAt(item, position);
            }
        } else {
            const wearPosition = player.getInventory().getWearPosition(item);
            if (!wearPosition) return;

            const itemEquipped = player.getItem(wearPosition);

            if (itemEquipped) {
                player.getInventory().removeItem(position, item.getSize());
                player.getInventory().removeItem(wearPosition, itemEquipped.getSize());

                const addedPosition = player.getInventory().addItem(itemEquipped);

                if (addedPosition >= 0) {
                    player.sendItemRemoved({
                        window: WindowTypeEnum.EQUIPMENT,
                        position: wearPosition,
                    });
                    player.sendItemRemoved({
                        window: WindowTypeEnum.INVENTORY,
                        position,
                    });
                    player.getInventory().addItemAt(item, wearPosition);
                    player.sendItemAdded({
                        window: WindowTypeEnum.EQUIPMENT,
                        position: wearPosition,
                        item,
                    });
                    player.sendItemAdded({
                        window: WindowTypeEnum.INVENTORY,
                        position: addedPosition,
                        item: itemEquipped,
                    });
                    await Promise.all([this.itemManager.update(itemEquipped), this.itemManager.update(item)]);
                } else {
                    player.getInventory().addItemAt(item, position);
                    player.getInventory().addItemAt(itemEquipped, wearPosition);
                    player.chat({
                        messageType: ChatMessageTypeEnum.INFO,
                        message: 'Inventory is full',
                    });
                }
            } else {
                player.getInventory().removeItem(position, item.getSize());
                player.getInventory().addItemAt(item, wearPosition);

                player.sendItemRemoved({
                    window: WindowTypeEnum.INVENTORY,
                    position,
                });
                player.sendItemAdded({
                    window: WindowTypeEnum.EQUIPMENT,
                    position: wearPosition,
                    item,
                });
                await this.itemManager.update(item);
            }
        }
    }

    private async useNonWearableItem() {
        //TODO
    }
}
