import Logger from '@/core/infra/logger/Logger';
import PacketHandler from '../../PacketHandler';
import ItemDropPacket from './ItemDropPacket';
import DropItemService from '@/game/app/service/DropItemService';
import GameConnection from '@/game/interface/networking/GameConnection';

export default class ItemDropPacketHandler extends PacketHandler<ItemDropPacket> {
    private readonly logger: Logger;
    private readonly dropItemService: DropItemService;

    constructor({ logger, dropItemService }: { logger: Logger; dropItemService: DropItemService }) {
        super();
        this.logger = logger;
        this.dropItemService = dropItemService;
    }

    async execute(connection: GameConnection, packet: ItemDropPacket) {
        if (!packet.isValid()) {
            this.logger.error(`[ItemDropPacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }

        const player = connection.getPlayer();

        if (!player) {
            this.logger.info(
                `[ItemDropPacketHandler] The connection does not have a player selected, this cannot happen`,
            );
            connection.close();
            return;
        }

        this.dropItemService.execute({
            player,
            window: packet.getWindow(),
            position: packet.getPosition(),
            gold: packet.getGold(),
            count: packet.getCount(),
        });
    }
}
