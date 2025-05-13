import Logger from '@/core/infra/logger/Logger';
import CommandHandler from '../../CommandHandler';
import LevelCommand from './LevelCommand';
import World from '@/core/domain/World';
import Player from '@/core/domain/entities/game/player/Player';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';

export default class LevelCommandHandler extends CommandHandler<LevelCommand> {
    private readonly logger: Logger;
    private readonly world: World;

    constructor({ logger, world }) {
        super();
        this.logger = logger;
        this.world = world;
    }

    async execute(player: Player, levelCommand: LevelCommand) {
        if (!levelCommand.isValid()) {
            const errors = levelCommand.errors();
            this.logger.error(levelCommand.getErrorMessage());
            player.sendCommandErrors(errors);
            return;
        }

        const [value, targetName] = levelCommand.getArgs();

        if (!targetName) {
            player.setPoint(PointsEnum.LEVEL, Number(value));
            return;
        }

        const target = this.world.getPlayerByName(targetName);

        if (!target) {
            player.chat({
                message: `Target: ${targetName} not found.`,
                messageType: ChatMessageTypeEnum.INFO,
            });
            return;
        }

        target.setPoint(PointsEnum.LEVEL, Number(value));
    }
}
