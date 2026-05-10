import Player from '@/core/domain/entities/game/player/Player';
import NPC from '@/core/domain/entities/game/mob/NPC';
import ShopManager from '@/core/domain/shop/ShopManager';
import ItemManager from '@/core/domain/manager/ItemManager';
import Logger from '@/core/infra/logger/Logger';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { ItemAntiFlagEnum } from '@/core/enum/ItemAntiFlagEnum';
import { ShopSubHeaderGC } from '@/core/enum/ShopSubHeaderEnum';
import { WindowTypeEnum } from '@/core/enum/WindowTypeEnum';

export default class ShopService {
    private readonly shopManager: ShopManager;
    private readonly itemManager: ItemManager;
    private readonly logger: Logger;

    constructor({
        shopManager,
        itemManager,
        logger,
    }: {
        shopManager: ShopManager;
        itemManager: ItemManager;
        logger: Logger;
    }) {
        this.shopManager = shopManager;
        this.itemManager = itemManager;
        this.logger = logger;
    }

    async openShop(player: Player, npc: NPC) {
        const shop = this.shopManager.getShop(npc.getId());
        if (!shop) {
            this.logger.debug(`[ShopService] NPC vnum ${npc.getId()} has no shop`);
            return;
        }

        player.setCurrentShop(shop);

        player.sendCurrentShop({
            ownerVid: npc.getVirtualId(),
            items: shop.getItems(),
        });

        this.logger.info(
            `[ShopService] Player ${player.getName()} opened shop "${shop.getShopName()}" (NPC ${npc.getId()})`,
        );
    }

    async closeShop(player: Player) {
        if (!player.getCurrentShop()) return;

        player.setCurrentShop(null);
        player.sendShopClose();

        this.logger.info(`[ShopService] Player ${player.getName()} closed shop`);
    }

    async buy(player: Player, pos: number) {
        const shop = player.getCurrentShop();
        if (!shop) {
            this.logger.debug(`[ShopService] buy: player ${player.getName()} has no open shop`);
            return;
        }

        const shopItem = shop.getItemAtSlot(pos);
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
            `[ShopService] Player ${player.getName()} bought vnum ${shopItem.vnum} x${shopItem.count} for ${price}g`,
        );
    }

    async sell(player: Player, pos: number, count: number) {
        const shop = player.getCurrentShop();
        if (!shop) {
            this.logger.debug(`[ShopService] sell: player ${player.getName()} has no open shop`);
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

        this.logger.info(`[ShopService] Player ${player.getName()} sold pos=${pos} x${sellCount} for ${sellPrice}g`);
    }
}
