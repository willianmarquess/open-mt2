import CommandHandler from '../../CommandHandler';
import RideCommand from './RideCommand';
import Player from '@/core/domain/entities/game/player/Player';
import Logger from '@/core/infra/logger/Logger';

export default class RideCommandHandler extends CommandHandler<RideCommand> {
    private readonly logger: Logger;

    constructor({ logger }: { logger: Logger }) {
        super();
        this.logger = logger;
    }

    async execute(player: Player, command: RideCommand) {
        if (!command.isValid()) {
            player.sendCommandErrors(command.errors());
            return;
        }

        player.toggleRiding();
    }
}
