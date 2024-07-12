import ChatMessageTypeEnum from '../../../core/enum/ChatMessageTypeEnum.js';
import WindowTypeEnum from '../../../core/enum/WindowTypeEnum.js';

export default class UseItemService {
    #logger;
    #itemManager;

    constructor({ logger, itemManager }) {
        this.#logger = logger;
        this.#itemManager = itemManager;
    }

    async execute({ player, window, position }) {
        this.#logger.debug(`[UseItemService] using item in window: ${window}, position: ${position}`);

        const item = player.getItem(position);

        if (!item) return;

        if (player.isWearable(item)) {
            await this.#useWearableItem({ player, item, position, window });
        } else {
            await this.#useNonWearableItem({ item, position, window });
        }
    }

    async #useWearableItem({ player, item, position, window }) {
        if (player.inventory.isEquipamentPosition(position)) {
            player.inventory.removeItem(position, item.size);
            const addedPosition = player.inventory.addItem(item);

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

                await this.#itemManager.update(item);
            } else {
                player.say({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: 'Inventory is full',
                });
                player.inventory.addItemAt(item, position);
            }
        } else {
            const wearPosition = player.inventory.getWearPosition(item);
            if (!wearPosition) return;

            const itemEquipped = player.getItem(wearPosition);

            if (itemEquipped) {
                player.inventory.removeItem(position, item.size);
                player.inventory.removeItem(wearPosition, itemEquipped.size);

                const addedPosition = player.inventory.addItem(itemEquipped);

                if (addedPosition >= 0) {
                    player.sendItemRemoved({
                        window: WindowTypeEnum.EQUIPMENT,
                        position: wearPosition,
                    });
                    player.sendItemRemoved({
                        window: WindowTypeEnum.INVENTORY,
                        position,
                    });
                    player.inventory.addItemAt(item, wearPosition);
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
                    await Promise.all([this.#itemManager.update(itemEquipped), this.#itemManager.update(item)]);
                } else {
                    player.inventory.addItemAt(item, position);
                    player.inventory.addItemAt(itemEquipped, wearPosition);
                    player.say({
                        messageType: ChatMessageTypeEnum.INFO,
                        message: 'Inventory is full',
                    });
                }
            } else {
                player.inventory.removeItem(position, item.size);
                player.inventory.addItemAt(item, wearPosition);

                player.sendItemRemoved({
                    window: WindowTypeEnum.INVENTORY,
                    position,
                });
                player.sendItemAdded({
                    window: WindowTypeEnum.EQUIPMENT,
                    position: wearPosition,
                    item,
                });
                await this.#itemManager.update(item);
            }
        }
    }

    async #useNonWearableItem({ /*item, position, window*/ }) {
        //TODO
    }
}
