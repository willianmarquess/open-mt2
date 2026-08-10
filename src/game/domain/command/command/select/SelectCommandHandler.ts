import CommandHandler from '../../CommandHandler';
import Player from '@/core/domain/entities/game/player/Player';
import SelectCommand from './SelectCommand';
import LeaveGameService from '@/game/domain/service/LeaveGameService';
import Logger from '@/core/infra/logger/Logger';

export default class SelectCommandHandler extends CommandHandler<SelectCommand> {
    private readonly leaveGameService: LeaveGameService;
    private readonly logger: Logger;

    constructor({ leaveGameService, logger }: { leaveGameService: LeaveGameService; logger: Logger }) {
        super();
        this.leaveGameService = leaveGameService;
        this.logger = logger;
    }

    async execute(player: Player) {
        player.backToSelect(() => {
            this.leaveGameService
                .execute(player)
                .catch((err) =>
                    this.logger.error(`[SelectCommand] Error leaving the world for ${player.getName()}: ${err}`),
                );
        });
    }
}
