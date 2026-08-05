import Player from '@/core/domain/entities/game/player/Player';
import ItemManager from '@/core/domain/manager/ItemManager';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { ItemAntiFlagEnum } from '@/core/enum/ItemAntiFlagEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import Logger from '@/core/infra/logger/Logger';

const GOLD_PROTO_ID = 1;

type DropItemServiceParams = {
    window: number;
    position: number;
    gold: number;
    count: number;
    player: Player;
};

export default class DropItemService {
    private readonly logger: Logger;
    private readonly itemManager: ItemManager;

    constructor({ logger, itemManager }: { logger: Logger; itemManager: ItemManager }) {
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
        if (player.isItemLockedInPrivateShop(item)) return;

        if (item.getAntiFlags().is(ItemAntiFlagEnum.ANTI_DROP | ItemAntiFlagEnum.ANTI_GIVE)) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: '[SYSTEM] This item cannot be dropped',
            });
            return;
        }

        if (!Number.isInteger(count) || count <= 0 || count > item.getCount()) return;

        if (count === item.getCount()) {
            player.getInventory().removeItem(position, item.getSize());
            player.sendItemRemoved({
                window,
                position,
            });

            player.dropItem({ count, item });
            await this.itemManager.delete(item);
            return;
        }

        const droppedPart = this.itemManager.getItem(item.getId(), count);

        if (!droppedPart) {
            this.logger.error(`[PLAYER] Missing the item proto ${item.getId()}`);
            return;
        }

        item.setCount(item.getCount() - count);

        player.sendItemAdded({
            window,
            position,
            item,
        });

        player.dropItem({ count, item: droppedPart });
        await this.itemManager.update(item);
        await this.itemManager.flush(player.getId());
    }

    dropGold(amount: number, player: Player) {
        const amountValidated = Math.max(0, Number(amount));

        if (amountValidated > player.getPoint(PointsEnum.GOLD)) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: '[SYSTEM] You are trying to drop more gold than you have',
            });
            this.logger.error(`[PLAYER] Player: ${player.getName()} is trying to drop more gold than they has`);
            return;
        }

        const gold = this.itemManager.getItem(GOLD_PROTO_ID, amountValidated);

        if (!gold) {
            this.logger.error(`[PLAYER] Missing the gold item proto ${GOLD_PROTO_ID}`);
            return;
        }

        player.addPoint(PointsEnum.GOLD, -amountValidated);
        player.dropItem({
            count: amountValidated,
            item: gold,
        });
    }
}
