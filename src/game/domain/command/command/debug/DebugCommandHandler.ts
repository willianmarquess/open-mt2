import Logger from '@/core/infra/logger/Logger';
import CommandHandler from '../../CommandHandler';
import DebugCommand from './DebugCommand';
import Player from '@/core/domain/entities/game/player/Player';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';

export default class DebugCommandHandler extends CommandHandler<DebugCommand> {
    private readonly logger: Logger;

    constructor({ logger }: { logger: Logger }) {
        super();
        this.logger = logger;
    }

    async execute(player: Player) {
        const enabled = player.toggleDebugMode();
        this.logger.info(`[DebugCommandHandler] Debug mode ${enabled ? 'on' : 'off'} for ${player.getName()}`);
        player.chat({
            message: `Debug messages ${enabled ? 'enabled' : 'disabled'}`,
            messageType: ChatMessageTypeEnum.INFO,
        });
    }
}
