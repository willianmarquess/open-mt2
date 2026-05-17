import GameConnection from '@/game/interface/networking/GameConnection';
import PacketHandler from '../../PacketHandler';
import Logger from '@/core/infra/logger/Logger';
import ShopPacket from './ShopPacket';
import { ShopSubHeaderCG } from '@/core/enum/ShopSubHeaderEnum';
import ShopService from '@/game/app/service/ShopService';

export default class ShopPacketHandler extends PacketHandler<ShopPacket> {
    private readonly logger: Logger;
    private readonly shopService: ShopService;

    constructor({ logger, shopService }: { logger: Logger; shopService: ShopService }) {
        super();
        this.logger = logger;
        this.shopService = shopService;
    }

    async execute(connection: GameConnection, packet: ShopPacket) {
        if (!packet.isValid()) {
            this.logger.error(`[ShopPacketHandler] Packet invalid: ${packet.getErrorMessage()}`);
            connection.close();
            return;
        }

        const player = connection.getPlayer();
        if (!player) {
            this.logger.info(`[ShopPacketHandler] No player on connection`);
            connection.close();
            return;
        }

        switch (packet.getShopSubHeader()) {
            case ShopSubHeaderCG.END:
                await this.shopService.closeShop(player);
                break;

            case ShopSubHeaderCG.BUY:
                await this.shopService.buy(player, packet.getPos());
                break;

            case ShopSubHeaderCG.SELL:
                await this.shopService.sell(player, packet.getPos(), 1);
                break;

            case ShopSubHeaderCG.SELL2:
                await this.shopService.sell(player, packet.getPos(), packet.getCount());
                break;

            default:
                this.logger.info(`[ShopPacketHandler] Unknown sub-header: ${packet.getSubHeader()}`);
                break;
        }
    }
}
