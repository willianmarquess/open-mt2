import Logger from '@/core/infra/logger/Logger';
import UseItemService from '@/game/app/service/UseItemService';
import PacketHandler from '../../PacketHandler';
import ItemUsePacket from './ItemUsePacket';
import GameConnection from '@/game/interface/networking/GameConnection';

export default class ItemUsePacketHandler extends PacketHandler<ItemUsePacket> {
    private readonly logger: Logger;
    private readonly useItemService: UseItemService;

    constructor({ logger, useItemService }) {
        super();
        this.logger = logger;
        this.useItemService = useItemService;
    }

    async execute(connection: GameConnection, packet: ItemUsePacket) {
        if (!packet.isValid()) {
            this.logger.error(`[ItemUsePacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }

        const window = packet.getWindow();
        const position = packet.getPosition();
        const player = connection.getPlayer();

        this.useItemService.execute(player, window, position);
    }
}
