import CommandHandler from '../../CommandHandler';
import UserHorseBackCommand from './UserHorseBackCommand';
import Player from '@/core/domain/entities/game/player/Player';
import World from '@/core/domain/World';
import Logger from '@/core/infra/logger/Logger';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';

export default class UserHorseBackCommandHandler extends CommandHandler<UserHorseBackCommand> {
    private readonly logger: Logger;
    private readonly world: World;

    constructor({ logger, world }: { logger: Logger; world: World }) {
        super();
        this.logger = logger;
        this.world = world;
    }

    async execute(player: Player, command: UserHorseBackCommand) {
        if (!command.isValid()) {
            player.sendCommandErrors(command.errors());
            return;
        }

        const [targetName] = command.getArgs();
        const target = targetName ? this.world.getPlayerByName(targetName) : player;

        if (!target) {
            player.chat({ messageType: ChatMessageTypeEnum.INFO, message: `Player '${targetName}' not found.` });
            return;
        }

        // Send away the horse entity (only works when NOT riding)
        if (!target.sendHorseAway()) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `Cannot send horse away. Either player is currently riding or no horse entity is active.`,
            });
            this.logger.debug(`[UserHorseBackCommand] sendHorseAway had no effect for ${target.getName()}`);
        }
    }
}
