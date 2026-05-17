import Logger from '@/core/infra/logger/Logger';
import BlockModeCommand from '@/game/domain/command/command/blockMode/BlockModeCommand';
import Player from '@/core/domain/entities/game/player/Player';
import CommandHandler from '../../CommandHandler';

export default class BlockModeCommandHandler extends CommandHandler<BlockModeCommand> {
    private readonly logger: Logger;

    constructor({ logger }: { logger: Logger }) {
        super();
        this.logger = logger;
    }

    async execute(player: Player, blockModeCommand: BlockModeCommand) {
        if (!blockModeCommand.isValid()) {
            const errors = blockModeCommand.errors();
            this.logger.error(blockModeCommand.getErrorMessage());
            player.sendCommandErrors(errors);
            return;
        }

        // The client keeps track of which buttons are toggled.
        // So mode can be 3 when Trade and Group are active.
        const [mode] = blockModeCommand.getArgs();

        if (player) {
            player.setBlockMode(Number(mode));
            player.sendBlockMode();
        }
    }
}
