import CommandHandler from '../../CommandHandler';
import UserHorseBackCommand from './UserHorseBackCommand';
import Player from '@/core/domain/entities/game/player/Player';
import Logger from '@/core/infra/logger/Logger';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';

export default class UserHorseBackCommandHandler extends CommandHandler<UserHorseBackCommand> {
    private readonly logger: Logger;

    constructor({ logger }: { logger: Logger }) {
        super();
        this.logger = logger;
    }

    async execute(player: Player) {
        if (!player.sendHorseAway()) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `Cannot send horse away. Either player is currently riding or no horse entity is active.`,
            });
            this.logger.debug(`[UserHorseBackCommand] sendHorseAway had no effect for ${player.getName()}`);
        }
    }
}
