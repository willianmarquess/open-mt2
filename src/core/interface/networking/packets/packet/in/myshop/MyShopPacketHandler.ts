import GameConnection from '@/game/interface/networking/GameConnection';
import PacketHandler from '../../PacketHandler';
import Logger from '@/core/infra/logger/Logger';
import MyShopPacket from './MyShopPacket';
import PrivateShopService from '@/game/app/service/PrivateShopService';

export default class MyShopPacketHandler extends PacketHandler<MyShopPacket> {
    private readonly logger: Logger;
    private readonly privateShopService: PrivateShopService;

    constructor({ logger, privateShopService }: { logger: Logger; privateShopService: PrivateShopService }) {
        super();
        this.logger = logger;
        this.privateShopService = privateShopService;
    }

    async execute(connection: GameConnection, packet: MyShopPacket) {
        if (!packet.isValid()) {
            this.logger.error(`[MyShopPacketHandler] Packet invalid: ${packet.getErrorMessage()}`);
            connection.close();
            return;
        }

        const player = connection.getPlayer();
        if (!player) {
            this.logger.info(`[MyShopPacketHandler] No player on connection`);
            connection.close();
            return;
        }

        // bCount = 0 means the player wants to close their private shop
        if (packet.getCount() === 0) {
            await this.privateShopService.closePrivateShop(player);
            return;
        }

        await this.privateShopService.openPrivateShop(player, packet.getSign(), packet.getItems());
    }
}
