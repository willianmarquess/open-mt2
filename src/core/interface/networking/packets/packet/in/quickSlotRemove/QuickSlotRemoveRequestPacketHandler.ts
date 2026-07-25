import PacketHandler from '../../PacketHandler';
import Logger from '@/core/infra/logger/Logger';
import GameConnection from '@/game/interface/networking/GameConnection';
import QuickSlotRemoveRequestPacket from './QuickSlotRemoveRequestPacket';

export default class QuickSlotRemoveRequestPacketHandler extends PacketHandler<QuickSlotRemoveRequestPacket> {
    private readonly logger: Logger;

    constructor({ logger }: { logger: Logger }) {
        super();
        this.logger = logger;
    }

    async execute(connection: GameConnection, packet: QuickSlotRemoveRequestPacket) {
        if (!packet.isValid()) {
            this.logger.error(`[QuickSlotRemoveRequestPacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }

        const player = connection.getPlayer();
        if (!player) {
            this.logger.error(
                `[QuickSlotRemoveRequestPacketHandler] Player not found for connection ${connection.getId()}`,
            );
            connection.close();
            return;
        }

        player.removeQuickSlot(packet.getSlot());
    }
}
