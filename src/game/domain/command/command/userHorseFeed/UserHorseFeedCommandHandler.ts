import CommandHandler from '../../CommandHandler';
import UserHorseFeedCommand from './UserHorseFeedCommand';
import Player from '@/core/domain/entities/game/player/Player';
import Item from '@/core/domain/entities/game/item/Item';
import ItemManager from '@/core/domain/manager/ItemManager';
import Logger from '@/core/infra/logger/Logger';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { WindowTypeEnum } from '@/core/enum/WindowTypeEnum';

// Grade-to-food vnum mapping: grade 1 → 50054, grade 2 → 50055, grade 3 → 50056
const HORSE_FOOD_VNUM_BY_GRADE: Record<number, number> = {
    1: 50054,
    2: 50055,
    3: 50056,
};

export default class UserHorseFeedCommandHandler extends CommandHandler<UserHorseFeedCommand> {
    private readonly logger: Logger;
    private readonly itemManager: ItemManager;

    constructor({ logger, itemManager }: { logger: Logger; itemManager: ItemManager }) {
        super();
        this.logger = logger;
        this.itemManager = itemManager;
    }

    async execute(player: Player) {
        const grade = player.getHorseGrade();

        if (grade <= 0 || player.getHorseLevel() <= 0) {
            player.chat({ messageType: ChatMessageTypeEnum.INFO, message: 'Please summon your horse first.' });
            return;
        }

        if (player.isHorseRiding()) {
            player.chat({ messageType: ChatMessageTypeEnum.INFO, message: 'You cannot feed the horse while riding.' });
            return;
        }

        if (player.getHorseHealth() <= 0) {
            player.chat({ messageType: ChatMessageTypeEnum.INFO, message: 'You cannot feed a dead horse.' });
            return;
        }

        if (player.getHorseHealth() >= player.getHorseMaxHealth()) {
            player.chat({ messageType: ChatMessageTypeEnum.INFO, message: 'Your horse is already at full health.' });
            return;
        }

        const foodVnum = HORSE_FOOD_VNUM_BY_GRADE[grade];
        if (!foodVnum) {
            this.logger.error(`[UserHorseFeedCommand] Unknown horse grade ${grade} for player ${player.getName()}`);
            return;
        }

        // Find the food item in inventory
        const foodItem = [...player.getInventory().getItems().values()].find((item) => item.getId() === foodVnum);

        if (!foodItem) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `You need horse food (item #${foodVnum}) to feed your horse.`,
            });
            return;
        }

        await this.consumeFoodItem(player, foodItem);
        player.feedHorse();
        player.chat({ messageType: ChatMessageTypeEnum.INFO, message: 'You fed your horse.' });
    }

    private async consumeFoodItem(player: Player, foodItem: Item) {
        if (foodItem.getCount() > 1) {
            foodItem.decreaseCount(1);
            player.sendItemUpdate(foodItem);
            await this.itemManager.update(foodItem);
            return;
        }

        player.getInventory().removeItem(foodItem.getPosition(), foodItem.getSize());
        player.sendItemRemoved({
            window: WindowTypeEnum.INVENTORY,
            position: foodItem.getPosition(),
        });
        await this.itemManager.delete(foodItem);
    }
}
