import GameConnection from '@/game/interface/networking/GameConnection';
import PacketHandler from '../../PacketHandler';
import Logger from '@/core/infra/logger/Logger';
import OnClickPacket from './OnClickPacket';
import { QuestManager } from '@/core/domain/quests/QuestManager';
import NPC from '@/core/domain/entities/game/mob/NPC';
import Player from '@/core/domain/entities/game/player/Player';
import ShopService from '@/game/app/service/ShopService';
import ShopManager from '@/core/domain/shop/ShopManager';
import PrivateShopService from '@/game/app/service/PrivateShopService';

export default class OnClickPacketHandler extends PacketHandler<OnClickPacket> {
    private readonly logger: Logger;
    private readonly questManager: QuestManager;
    private readonly shopService: ShopService;
    private readonly shopManager: ShopManager;
    private readonly privateShopService: PrivateShopService;

    constructor({
        logger,
        questManager,
        shopManager,
        shopService,
        privateShopService,
    }: {
        logger: Logger;
        questManager: QuestManager;
        shopManager: ShopManager;
        shopService: ShopService;
        privateShopService: PrivateShopService;
    }) {
        super();
        this.logger = logger;
        this.questManager = questManager;
        this.shopService = shopService;
        this.shopManager = shopManager;
        this.privateShopService = privateShopService;
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

        // If the clicked entity is a player running a private shop, open it for the guest
        if (target instanceof Player) {
            if (target.isRunningPrivateShop()) {
                if (target === player) {
                    // Owner clicked themselves - re-send the shop listing to open the management UI
                    await this.privateShopService.openShopForOwner(player);
                    return;
                }
                this.logger.info(
                    `[OnClickPacketHandler] ${player.getName()} clicked private shop owner: ${target.getName()}`,
                );
                await this.privateShopService.openShopForGuest(player, target);
            }
            return;
        }

        const npc = target as NPC;
        this.logger.info(`[OnClickPacketHandler] You have clicked on: ${npc.getId()}`);

        // If the npc has a quest and is a shop, then do the quest first and skip opening the shop
        this.questManager.onClick(player, npc);

        if (this.shopManager.hasShop(npc.getId())) {
            await this.shopService.openShop(player, npc);
        }
    }
}
