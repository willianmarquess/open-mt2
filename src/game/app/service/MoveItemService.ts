import Player from '@/core/domain/entities/game/player/Player';
import { MAX_ITEM_STACK } from '@/core/domain/entities/game/item/Item';
import ItemManager from '@/core/domain/manager/ItemManager';
import Logger from '@/core/infra/logger/Logger';
import { WindowTypeEnum } from '@/core/enum/WindowTypeEnum';

type MoveItemServiceParams = {
    player: Player;
    fromWindow: number;
    fromPosition: number;
    toWindow: number;
    toPosition: number;
    count: number;
};

export default class MoveItemService {
    private readonly logger: Logger;
    private readonly itemManager: ItemManager;

    constructor({ logger, itemManager }: { logger: Logger; itemManager: ItemManager }) {
        this.logger = logger;
        this.itemManager = itemManager;
    }

    async execute({ player, fromWindow, fromPosition, toWindow, toPosition, count }: MoveItemServiceParams) {
        this.logger.debug(`[MoveItemService] moving item from ${fromPosition} to ${toPosition} (count: ${count})`);

        const item = player.getItem(fromPosition);
        if (!item) return;

        const stackCount = item.getCount() ?? 1;

        // count 0 (or the whole stack, or a non stackable item) is a plain move.
        // A smaller count on a stackable item is a split: the source stack is
        // decreased and the units are placed (or merged) at the target slot,
        // like the original server's CHARACTER::MoveItem.
        if (count === 0 || count >= stackCount || !item.isStackable()) {
            const updatedItem = player.moveItem({ fromWindow, fromPosition, toWindow, toPosition });

            if (updatedItem) {
                await this.itemManager.update(updatedItem);
            }
            return;
        }

        await this.split({ player, fromWindow, fromPosition, toWindow, toPosition, count, item });
    }

    private async split({
        player,
        fromWindow,
        fromPosition,
        toWindow,
        toPosition,
        count,
        item,
    }: MoveItemServiceParams & { item: NonNullable<ReturnType<Player['getItem']>> }) {
        if (fromWindow !== WindowTypeEnum.INVENTORY || toWindow !== WindowTypeEnum.INVENTORY) return;

        const inventory = player.getInventory();
        if (!inventory.isValidPosition(toPosition)) return;
        if (inventory.isEquipmentPosition(toPosition)) return;

        const target = player.getItem(toPosition);

        if (target) {
            // Merge the split units into a same-proto stack at the target slot
            if (target.getId() !== item.getId() || !target.isStackable()) return;

            const moved = Math.min(MAX_ITEM_STACK - target.getCount(), count);
            if (moved <= 0) return;

            target.setCount(target.getCount() + moved);
            item.setCount(item.getCount() - moved);
            player.sendItemUpdate(target);
            player.sendItemUpdate(item);

            await this.itemManager.update(target);
            await this.itemManager.update(item);
            await this.itemManager.flush(player.getId());
            return;
        }

        // Place the split units as a new stack in the empty target slot
        if (!inventory.haveAvailablePosition(toPosition, item.getSize())) return;

        const newStack = this.itemManager.getItem(item.getId(), count);
        if (!newStack) return;

        inventory.addItemAt(newStack, toPosition);
        item.setCount(item.getCount() - count);

        player.sendItemAdded({ window: toWindow, position: toPosition, item: newStack });
        player.sendItemUpdate(item);

        await this.itemManager.save(newStack);
        await this.itemManager.update(item);
        await this.itemManager.flush(player.getId());
    }
}
