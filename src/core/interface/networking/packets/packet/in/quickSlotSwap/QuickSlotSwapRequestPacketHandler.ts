import PacketHandler from '../../PacketHandler';
import Logger from '@/core/infra/logger/Logger';
import GameConnection from '@/game/interface/networking/GameConnection';
import QuickSlotSwapRequestPacket from './QuickSlotSwapRequestPacket';

export default class QuickSlotSwapRequestPacketHandler extends PacketHandler<QuickSlotSwapRequestPacket> {
    private readonly logger: Logger;

    constructor({ logger }: { logger: Logger }) {
        super();
        this.logger = logger;
    }

    async execute(connection: GameConnection, packet: QuickSlotSwapRequestPacket) {
        if (!packet.isValid()) {
            this.logger.error(`[QuickSlotSwapRequestPacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }

        const player = connection.getPlayer();
        if (!player) {
            this.logger.error(
                `[QuickSlotSwapRequestPacketHandler] Player not found for connection ${connection.getId()}`,
            );
            connection.close();
            return;
        }

        player.swapQuickSlot(packet.getSlotA(), packet.getSlotB());
    }
}
