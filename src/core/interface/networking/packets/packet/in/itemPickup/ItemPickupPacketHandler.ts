import Logger from '@/core/infra/logger/Logger';
import PickupItemService from '@/game/app/service/PickupItemService';
import PacketHandler from '../../PacketHandler';
import ItemPickupPacket from './ItemPickupPacket';
import GameConnection from '@/game/interface/networking/GameConnection';

export default class ItemPickupPacketHandler extends PacketHandler<ItemPickupPacket> {
    private readonly logger: Logger;
    private readonly pickupItemService: PickupItemService;

    constructor({ logger, pickupItemService }: { logger: Logger; pickupItemService: PickupItemService }) {
        super();
        this.logger = logger;
        this.pickupItemService = pickupItemService;
    }

    async execute(connection: GameConnection, packet: ItemPickupPacket) {
        if (!packet.isValid()) {
            this.logger.error(`[ItemPickupPacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }

        const virtualId = packet.getVirtualId();
        const player = connection.getPlayer();

        if (!player) {
            this.logger.info(
                `[ItemPickupPacketHandler] The connection does not have a player selected, this cannot happen`,
            );
            connection.close();
            return;
        }

        this.pickupItemService.execute(player, virtualId);
    }
}
