import GameConnection from '@/game/interface/networking/GameConnection';
import PacketHandler from '../../PacketHandler';
import Logger from '@/core/infra/logger/Logger';
import QuestButtonPacket from './QuestButtonPacket';
import { QuestManager } from '@/core/domain/quests/QuestManager';

export default class QuestButtonPacketHandler extends PacketHandler<QuestButtonPacket> {
    private logger: Logger;
    private questManager: QuestManager;

    constructor({ logger, questManager }: { logger: Logger; questManager: QuestManager }) {
        super();
        this.logger = logger;
        this.questManager = questManager;
    }

    async execute(connection: GameConnection, packet: QuestButtonPacket) {
        if (!packet.isValid()) {
            this.logger.error(`[QuestButtonPacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }

        const player = connection.getPlayer();

        if (!player) {
            this.logger.info(
                `[QuestButtonPacketHandler] The connection does not have a player selected, this cannot happen`,
            );
            connection.close();
            return;
        }

        this.questManager.onButton(player, packet.getQuestId());
    }
}
