import Logger from '@/core/infra/logger/Logger';
import CommandHandler from '../../CommandHandler';
import CloseShopCommand from './CloseShopCommand';
import Player from '@/core/domain/entities/game/player/Player';
import PrivateShopService from '@/game/app/service/PrivateShopService';

export default class CloseShopCommandHandler extends CommandHandler<CloseShopCommand> {
    private readonly logger: Logger;
    private readonly privateShopService: PrivateShopService;

    constructor({ logger, privateShopService }: { logger: Logger; privateShopService: PrivateShopService }) {
        super();
        this.logger = logger;
        this.privateShopService = privateShopService;
    }

    async execute(player: Player) {
        this.logger.info(`[CloseShopCommandHandler] ${player.getName()} requested to close their private shop`);
        await this.privateShopService.closePrivateShop(player);
    }
}
