import Logger from '@/core/infra/logger/Logger';
import ExperienceCommand from '@/game/domain/command/command/exp/ExperienceCommand';
import World from '@/core/domain/World';
import Player from '@/core/domain/entities/game/player/Player';
import CommandHandler from '../../CommandHandler';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';

export default class ExperienceCommandHandler extends CommandHandler<ExperienceCommand> {
    private logger: Logger;
    private world: World;

    constructor({ logger, world }) {
        super();
        this.logger = logger;
        this.world = world;
    }

    async execute(player: Player, experienceCommand: ExperienceCommand) {
        if (!experienceCommand.isValid()) {
            const errors = experienceCommand.errors();
            this.logger.error(experienceCommand.getErrorMessage());
            player.sendCommandErrors(errors);
            return;
        }

        const [value, targetName] = experienceCommand.getArgs();

        if (!targetName) {
            player.addExperience(Number(value));
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

        target.addExperience(Number(value));
    }
}
