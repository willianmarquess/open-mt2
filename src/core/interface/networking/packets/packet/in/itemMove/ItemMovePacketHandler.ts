import Logger from '@/core/infra/logger/Logger';
import MoveItemService from '@/game/app/service/MoveItemService';
import PacketHandler from '../../PacketHandler';
import ItemMovePacket from './ItemMovePacket';
import GameConnection from '@/game/interface/networking/GameConnection';

export default class ItemMovePacketHandler extends PacketHandler<ItemMovePacket> {
    private logger: Logger;
    private moveItemService: MoveItemService;

    constructor({ logger, moveItemService }: { logger: Logger; moveItemService: MoveItemService }) {
        super();
        this.logger = logger;
        this.moveItemService = moveItemService;
    }

    async execute(connection: GameConnection, packet: ItemMovePacket) {
        if (!packet.isValid()) {
            this.logger.error(`[ItemMovePacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }

        const player = connection.getPlayer();

        if (!player) {
            this.logger.info(
                `[ItemMovePacketHandler] The connection does not have a player selected, this cannot happen`,
            );
            connection.close();
            return;
        }

        this.moveItemService.execute({
            player,
            fromWindow: packet.getFromWindow(),
            fromPosition: packet.getFromPosition(),
            toWindow: packet.getToWindow(),
            toPosition: packet.getToPosition(),
        });
    }
}
