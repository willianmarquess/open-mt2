import CommandHandler from '../../CommandHandler';
import UserHorseFeedCommand from './UserHorseFeedCommand';
import Player from '@/core/domain/entities/game/player/Player';
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

    constructor({ logger }: { logger: Logger }) {
        super();
        this.logger = logger;
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

        player.getInventory().removeItem(foodItem.getPosition(), foodItem.getSize());
        player.feedHorse();
        player.chat({ messageType: ChatMessageTypeEnum.INFO, message: 'You fed your horse.' });
    }
}
