import ChatMessageTypeEnum from '../../../core/enum/ChatMessageTypeEnum.js';

export default class DropItemService {
    #logger;
    #itemManager;

    constructor({ logger, itemManager }) {
        this.#logger = logger;
        this.#itemManager = itemManager;
    }

    async execute({ window, position, gold, count, player }) {
        if (gold > 0) {
            this.#dropGold({ amount: gold, player });
            return;
        }

        const item = player.inventory.getItem(position);

        if (!item) return;

        if (count === item.count) {
            player.inventory.removeItem(position, item.size);
            player.sendItemRemoved({
                window,
                position,
            });
        } else {
            item.count -= count;

            player.sendItemAdded({
                window,
                position,
                item,
            });
        }

        player.dropItem({ count, item });
        await this.#itemManager.delete(item);
    }

    #dropGold({ amount, player }) {
        const amountValidated = Math.max(0, Number(amount));

        if (amountValidated > player.gold) {
            player.say({
                messageType: ChatMessageTypeEnum.INFO,
                message: 'You are trying to drop more gold than you have',
            });
            this.#logger.error(`[PLAYER] Player: ${this.id} is trying to drop more gold than he has`);
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
