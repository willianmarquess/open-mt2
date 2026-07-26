import GameConnection from '@/game/interface/networking/GameConnection';
import PacketHandler from '../../PacketHandler';
import Logger from '@/core/infra/logger/Logger';
import ShopPacket from './ShopPacket';
import { ShopSubHeaderCG } from '@/core/enum/ShopSubHeaderEnum';
import ShopManager from '@/core/domain/shop/ShopManager';

export default class ShopPacketHandler extends PacketHandler<ShopPacket> {
    private readonly logger: Logger;
    private readonly shopManager: ShopManager;

    constructor({ logger, shopManager }: { logger: Logger; shopManager: ShopManager }) {
        super();
        this.logger = logger;
        this.shopManager = shopManager;
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
                await this.shopManager.closeShop(player);
                break;

            case ShopSubHeaderCG.BUY:
                await this.shopManager.buy(player, packet.getPos());
                break;

            case ShopSubHeaderCG.SELL:
                // No count in the plain SELL sub-header: sell the whole stack
                // (0 is normalized to the full count, like the original server).
                await this.shopManager.sell(player, packet.getPos(), 0);
                break;

            case ShopSubHeaderCG.SELL2:
                await this.shopManager.sell(player, packet.getPos(), packet.getCount());
                break;

            default:
                this.logger.info(`[ShopPacketHandler] Unknown sub-header: ${packet.getSubHeader()}`);
                break;
        }
    }
}
