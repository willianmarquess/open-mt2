import GameConnection from '@/game/interface/networking/GameConnection';
import PacketHandler from '../../PacketHandler';
import Logger from '@/core/infra/logger/Logger';
import QuestAnswerPacket from './QuestAnswerPacket';
import { QuestManager } from '@/core/domain/quests/QuestManager';

export default class QuestAnswerPacketHandler extends PacketHandler<QuestAnswerPacket> {
    private logger: Logger;
    private questManager: QuestManager;

    constructor({ logger, questManager }: { logger: Logger; questManager: QuestManager }) {
        super();
        this.logger = logger;
        this.questManager = questManager;
    }

    async execute(connection: GameConnection, packet: QuestAnswerPacket) {
        if (!packet.isValid()) {
            this.logger.error(`[QuestAnswerPacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }

        const player = connection.getPlayer();

        if (!player) {
            this.logger.info(
                `[QuestAnswerPacketHandler] The connection does not have a player selected, this cannot happen`,
            );
            connection.close();
            return;
        }

        this.logger.info(`[QuestAnswerPacketHandler] Player ${player.getId()} Answer ${packet.getAnswer()}`);

        this.questManager.onAnswer(player, packet.getAnswer());
    }
}
