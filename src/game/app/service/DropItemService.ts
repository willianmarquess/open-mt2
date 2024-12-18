import Player from "@/core/domain/entities/game/player/Player";
import ItemManager from "@/core/domain/manager/ItemManager";
import { ChatMessageTypeEnum } from "@/core/enum/ChatMessageTypeEnum";
import Logger from "@/core/infra/logger/Logger";

type DropItemServiceParams = {
    window: number, 
    position: number, 
    gold: number, 
    count: number, 
    player: Player
}

export default class DropItemService {
    private readonly logger: Logger;
    private readonly itemManager: ItemManager;

    constructor({ logger, itemManager }) {
        this.logger = logger;
        this.itemManager = itemManager;
    }

    async execute({ window, position, gold, count, player }: DropItemServiceParams) {
        if (gold > 0) {
            this.dropGold(gold, player);
            return;
        }

        const item = player.getInventory().getItem(position);

        if (!item) return;

        if (count === item.getCount()) {
            player.getInventory().removeItem(position, item.getSize());
            player.sendItemRemoved({
                window,
                position,
            });
        } else {
            item.setCount(item.getCount() - count);

            player.sendItemAdded({
                window,
                position,
                item,
            });
        }

        player.dropItem({ count, item });
        await this.itemManager.delete(item);
    }

    dropGold(amount: number, player: Player) {
        const amountValidated = Math.max(0, Number(amount));

        if (amountValidated > player.getGold()) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: 'You are trying to drop more gold than you have',
            });
            this.logger.error(`[PLAYER] Player: ${player.getName()} is trying to drop more gold than he has`);
            return;
        }

        player.addGold(-amount);
        player.dropItem({
            count: amount,
            item: {
                id: 1,
                count: amount,
            },
        });
    }
}
