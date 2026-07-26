import GameConnection from '@/game/interface/networking/GameConnection';
import PacketHandler from '../../PacketHandler';
import Logger from '@/core/infra/logger/Logger';
import OnClickPacket from './OnClickPacket';
import { QuestManager } from '@/core/domain/quests/QuestManager';
import NPC from '@/core/domain/entities/game/mob/NPC';
import ShopManager from '@/core/domain/shop/ShopManager';
import { EntityManager } from '@/core/domain/manager/EntityManager';

export default class OnClickPacketHandler extends PacketHandler<OnClickPacket> {
    private readonly logger: Logger;
    private readonly questManager: QuestManager;
    private readonly shopManager: ShopManager;
    private readonly entityManager: EntityManager;

    constructor({
        logger,
        questManager,
        shopManager,
        entityManager,
    }: {
        logger: Logger;
        questManager: QuestManager;
        shopManager: ShopManager;
        entityManager: EntityManager;
    }) {
        super();
        this.logger = logger;
        this.questManager = questManager;
        this.shopManager = shopManager;
        this.entityManager = entityManager;
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

        const target = this.entityManager.getEntity(packet.getTargetVirtualId());

        if (!target) {
            this.logger.info(
                `[OnClickPacketHandler] The targetId not exists with virtualId: ${packet.getTargetVirtualId()}`,
            );
            return;
        }

        //TODO: validate id the target item is in the same map, maybe the distance too (avoid hacking)

        if (target instanceof NPC) {
            this.logger.info(`[OnClickPacketHandler] You have clicked on: ${target.getId()}`);
        }

        // If the npc has a quest and is a shop, then do the quest first and skip opening the shop
        const isInQuestMenu = await this.questManager.onClick(player, target as NPC);

        if (!isInQuestMenu) {
            await this.shopManager.openShop(target, player);
        }
    }
}
