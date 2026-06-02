import Player from '@/core/domain/entities/game/player/Player';
import ShopService from '@/game/app/service/ShopService';
import ItemManager from '@/core/domain/manager/ItemManager';
import Logger from '@/core/infra/logger/Logger';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { ItemAntiFlagEnum } from '@/core/enum/ItemAntiFlagEnum';
import { ShopSubHeaderGC } from '@/core/enum/ShopSubHeaderEnum';
import { WindowTypeEnum } from '@/core/enum/WindowTypeEnum';
import PrivateShopService from '../../../game/app/service/PrivateShopService';
import GameEntity from '@/core/domain/entities/game/GameEntity';
import NPC from '../entities/game/mob/NPC';

export default class ShopManager {
    private readonly shopService: ShopService;
    private readonly itemManager: ItemManager;
    private readonly privateShopService: PrivateShopService;
    private readonly logger: Logger;

    constructor({
        shopService,
        itemManager,
        privateShopService,
        logger,
    }: {
        shopService: ShopService;
        itemManager: ItemManager;
        privateShopService: PrivateShopService;
        logger: Logger;
    }) {
        this.shopService = shopService;
        this.itemManager = itemManager;
        this.privateShopService = privateShopService;
        this.logger = logger;
    }

    async openShop(target: GameEntity, player: Player, id?: number) {
        await this.openPlayerShop(target as Player, player);
        await this.openNpcShop(target as NPC, player, id);
    }

    async openNpcShop(npc: NPC, player: Player, id?: number) {
        if (!npc.isNPC()) {
            return;
        }

        const shop = this.shopService.getShop(id ?? npc.getId());
        if (!shop) {
            this.logger.debug(`[ShopManager] NPC vnum ${npc.getId()} has no shop`);
            return;
        }

        //TODO: validate if player can open the shop (distance, isExchanging, HasShopOpened, etc)
        //TODO: verify player distance to npc

        player.setCurrentShop(shop);

        player.sendCurrentShop({
            ownerVid: npc.getVirtualId(),
            items: shop.getItems(),
        });

        this.logger.info(
            `[ShopManager] Player ${player.getName()} opened shop "${shop.getShopName()}" (NPC ${npc.getId()})`,
        );
    }

    async openPlayerShop(targetPlayer: Player, player: Player) {
        if (!targetPlayer.isPlayer()) {
            return;
        }

        if (targetPlayer.isRunningPrivateShop()) {
            if (targetPlayer === player) {
                // Owner clicked themselves - re-send the shop listing to open the management UI
                await this.privateShopService.openShopForOwner(player);
                return;
            }
            this.logger.debug(
                `[OnClickPacketHandler] ${player.getName()} clicked private shop owner: ${targetPlayer.getName()}`,
            );
            await this.privateShopService.openShopForGuest(player, targetPlayer);
        }
    }

    async closeShop(player: Player) {
        // If browsing a private shop, leave it gracefully
        const privateOwner = player.getCurrentPrivateShopOwner();
        if (privateOwner) {
            privateOwner.getPrivateShop()?.removeGuest(player);
            player.setCurrentPrivateShopOwner(null);
            player.sendShopClose();
            this.logger.info(`[ShopManager] Player ${player.getName()} left private shop of ${privateOwner.getName()}`);
            return;
        }

        if (!player.getCurrentShop()) return;

        player.setCurrentShop(null);
        player.sendShopClose();

        this.logger.info(`[ShopManager] Player ${player.getName()} closed shop`);
    }

    async buy(player: Player, pos: number) {
        // Route to private shop service if the player is browsing a private shop
        if (player.getCurrentPrivateShopOwner()) {
            await this.privateShopService.buy(player, pos);
            return;
        }

        const shop = player.getCurrentShop();
        if (!shop) {
            this.logger.debug(`[ShopManager] buy: player ${player.getName()} has no open shop`);
            return;
        }

        const shopItem = shop.getItem(pos);
        if (!shopItem) {
            player.sendShopResult({ result: ShopSubHeaderGC.INVALID_POS });
            return;
        }

        const price = shopItem.price;
        const playerGold = player.getPoint(PointsEnum.GOLD);

        if (playerGold < price) {
            player.sendShopResult({ result: ShopSubHeaderGC.NOT_ENOUGH_MONEY });
            return;
        }

        // Build a fresh item instance from proto
        const item = this.itemManager.getItem(shopItem.vnum, shopItem.count);
        if (!item) {
            player.sendShopResult({ result: ShopSubHeaderGC.SOLD_OUT });
            return;
        }

        if (!player.addItem(item)) {
            player.sendShopResult({ result: ShopSubHeaderGC.INVENTORY_FULL });
            return;
        }

        player.addPoint(PointsEnum.GOLD, -price);
        await this.itemManager.save(item);

        player.sendShopResult({ result: ShopSubHeaderGC.OK });

        this.logger.info(
            `[ShopManager] Player ${player.getName()} bought vnum ${shopItem.vnum} x${shopItem.count} for ${price}g`,
        );
    }

    async sell(player: Player, pos: number, count: number) {
        const shop = player.getCurrentShop();
        if (!shop) {
            this.logger.debug(`[ShopManager] sell: player ${player.getName()} has no open shop`);
            return;
        }

        const item = player.getItem(pos);
        if (!item) {
            player.sendShopResult({ result: ShopSubHeaderGC.INVALID_POS });
            return;
        }

        // Cannot sell items flagged as anti-sell
        if (item.getAntiFlags().is(ItemAntiFlagEnum.ANTI_SELL)) {
            player.sendShopResult({ result: ShopSubHeaderGC.INVALID_POS });
            return;
        }

        const sellCount = Math.min(count, item.getCount() ?? 1);
        const sellPrice = Math.floor((item.getShopPrice() * sellCount) / 5);

        // Remove item from inventory and notify client
        player.getInventory().removeItem(pos, item.getSize());
        player.sendItemRemoved({ window: WindowTypeEnum.INVENTORY, position: pos });
        await this.itemManager.delete(item);

        player.addPoint(PointsEnum.GOLD, sellPrice);

        player.sendShopResult({ result: ShopSubHeaderGC.OK });

        this.logger.info(`[ShopManager] Player ${player.getName()} sold pos=${pos} x${sellCount} for ${sellPrice}g`);
    }
}
