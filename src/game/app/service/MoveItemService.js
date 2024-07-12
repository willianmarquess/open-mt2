import WindowTypeEnum from '../../../core/enum/WindowTypeEnum.js';

export default class MoveItemService {
    #logger;
    #itemManager;

    constructor({ logger, itemManager }) {
        this.#logger = logger;
        this.#itemManager = itemManager;
    }

    async execute({ player, fromWindow, fromPosition, toWindow, toPosition /*count*/ }) {
        this.#logger.debug(`[MoveItemService] moving item from ${fromPosition} to ${toPosition}`);

        const item = player.getItem(fromPosition);

        if (!item) return;
        if (fromWindow !== WindowTypeEnum.INVENTORY || toWindow !== WindowTypeEnum.INVENTORY) return;
        if (!player.inventory.isValidPosition(toPosition)) return;
        if (!player.inventory.haveAvailablePosition(toPosition, item.size)) return;

        if (player.inventory.isEquipamentPosition(toPosition)) {
            if (!player.isWearable(item)) return;
            if (!player.inventory.isValidSlot(item, toPosition)) return;
        }

        player.inventory.removeItem(fromPosition, item.size);
        player.inventory.addItemAt(item, toPosition);

        player.sendItemRemoved({
            window: fromWindow,
            position: fromPosition,
        });
        player.sendItemAdded({
            window: toWindow,
            position: toPosition,
            item,
        });

        await this.#itemManager.update(item);
    }
}
