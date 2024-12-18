import Logger from '@/core/infra/logger/Logger';
import CommandHandler from '../../CommandHandler';
import LogoutCommand from './LogoutCommand';
import Player from '@/core/domain/entities/game/player/Player';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';

export default class LogoutCommandHandler extends CommandHandler<LogoutCommand> {
    private readonly logger: Logger;

    constructor({ logger }) {
        super();
        this.logger = logger;
    }

    async execute(player: Player) {
        this.logger.info(`[LogoutCommandHandler] Logout account. id: ${player.getId()}`);
        player.chat({
            message: `Logging out`,
            messageType: ChatMessageTypeEnum.INFO,
        });
        player.logout();
    }
}
