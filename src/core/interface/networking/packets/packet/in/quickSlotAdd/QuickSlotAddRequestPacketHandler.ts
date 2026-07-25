import PacketHandler from '../../PacketHandler';
import Logger from '@/core/infra/logger/Logger';
import GameConnection from '@/game/interface/networking/GameConnection';
import QuickSlotAddRequestPacket from './QuickSlotAddRequestPacket';

export default class QuickSlotAddRequestPacketHandler extends PacketHandler<QuickSlotAddRequestPacket> {
    private readonly logger: Logger;

    constructor({ logger }: { logger: Logger }) {
        super();
        this.logger = logger;
    }

    async execute(connection: GameConnection, packet: QuickSlotAddRequestPacket) {
        if (!packet.isValid()) {
            this.logger.error(`[QuickSlotAddRequestPacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }

        const player = connection.getPlayer();
        if (!player) {
            this.logger.error(
                `[QuickSlotAddRequestPacketHandler] Player not found for connection ${connection.getId()}`,
            );
            connection.close();
            return;
        }

        player.addQuickSlot(packet.getSlot(), packet.getType(), packet.getPosition());
    }
}
