import CommandHandler from '../../CommandHandler';
import UserHorseRideCommand from './UserHorseRideCommand';
import Player from '@/core/domain/entities/game/player/Player';
import World from '@/core/domain/World';
import Logger from '@/core/infra/logger/Logger';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';

export default class UserHorseRideCommandHandler extends CommandHandler<UserHorseRideCommand> {
    private readonly logger: Logger;
    private readonly world: World;

    constructor({ logger, world }: { logger: Logger; world: World }) {
        super();
        this.logger = logger;
        this.world = world;
    }

    async execute(player: Player, command: UserHorseRideCommand) {
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

        if (!target.startRiding()) {
            this.logger.debug(`[UserHorseRideCommand] startRiding had no effect for ${target.getName()}`);
        }
    }
}
