import GameConnection from '@/game/interface/networking/GameConnection';
import PacketHandler from '../../PacketHandler';
import Logger from '@/core/infra/logger/Logger';
import OnClickPacket from './OnClickPacket';
import { QuestManager } from '@/core/domain/quests/QuestManager';
import NPC from '@/core/domain/entities/game/mob/NPC';

export default class OnClickPacketHandler extends PacketHandler<OnClickPacket> {
    private readonly logger: Logger;
    private readonly questManager: QuestManager;

    constructor({ logger, questManager }: { logger: Logger; questManager: QuestManager }) {
        super();
        this.logger = logger;
        this.questManager = questManager;
    }

    async execute(connection: GameConnection, packet: OnClickPacket) {
        if (!packet.isValid()) {
            this.logger.error(`[OnClickPacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }

        const player = connection.getPlayer();

        if (!player) {
            this.logger.info(
                `[OnClickPacketHandler] The connection does not have a player selected, this cannot happen`,
            );
            connection.close();
            return;
        }

        const area = player.getArea();

        if (!area) {
            this.logger.info(`[OnClickPacketHandler] The area not exists on player, this cannot happen`);
            connection.close();
            return;
        }

        const target = area.getEntity(packet.getTargetVirtualId());

        if (!target) {
            this.logger.info(
                `[OnClickPacketHandler] The targetId not exists with virtualId: ${packet.getTargetVirtualId()}`,
            );
            connection.close();
            return;
        }

        this.logger.info(`[OnClickPacketHandler] You have clicked on: ${(target as NPC).getId()}`);
        this.questManager.onClick(player, target as NPC);
    }
}
