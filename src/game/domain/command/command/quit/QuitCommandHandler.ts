import Logger from '@/core/infra/logger/Logger';
import CommandHandler from '../../CommandHandler';
import QuitCommand from './QuitCommand';
import Player from '@/core/domain/entities/game/player/Player';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';

export default class QuitCommandHandler extends CommandHandler<QuitCommand> {
    private readonly logger: Logger;

    constructor({ logger }) {
        super();
        this.logger = logger;
    }

    async execute(player: Player) {
        this.logger.info(`[QuitCommandHandler] Quit client. id: ${player.getId()}`);
        player.chat({
            message: `Quitting game`,
            messageType: ChatMessageTypeEnum.INFO,
        });
        player.chat({
            message: 'quit',
            messageType: ChatMessageTypeEnum.COMMAND,
        });
    }
}
