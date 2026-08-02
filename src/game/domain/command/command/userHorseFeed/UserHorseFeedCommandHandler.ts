import CommandHandler from '../../CommandHandler';
import UserHorseFeedCommand from './UserHorseFeedCommand';
import Player from '@/core/domain/entities/game/player/Player';
import UseItemService from '@/game/app/service/UseItemService';
import Logger from '@/core/infra/logger/Logger';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';

// Grade-to-food vnum mapping: grade 1 → 50054, grade 2 → 50055, grade 3 → 50056
const HORSE_FOOD_VNUM_BY_GRADE: Record<number, number> = {
    1: 50054,
    2: 50055,
    3: 50056,
};

export default class UserHorseFeedCommandHandler extends CommandHandler<UserHorseFeedCommand> {
    private readonly logger: Logger;
    private readonly useItemService: UseItemService;

    constructor({ logger, useItemService }: { logger: Logger; useItemService: UseItemService }) {
        super();
        this.logger = logger;
        this.useItemService = useItemService;
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

        if (!player.feedHorse()) return;
        await this.useItemService.removeItemByQuantity(player, foodItem);
        player.chat({ messageType: ChatMessageTypeEnum.INFO, message: 'You fed your horse.' });
    }
}
