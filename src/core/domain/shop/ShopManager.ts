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
import MathUtil from '@/core/domain/util/MathUtil';

/** Maximum distance (map units) between player and shop owner for shop interactions. */
const SHOP_MAX_DISTANCE = 2000;

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

        // Leave any private shop being browsed first — buy() checks the
        // private-shop state before the NPC shop, so a stale owner reference
        // would route NPC-shop purchases to the private shop's display slots.
        const privateOwner = player.getCurrentPrivateShopOwner();
        if (privateOwner) {
            privateOwner.getPrivateShop()?.removeGuest(player);
            player.setCurrentPrivateShopOwner(null);
        }

        if (!this.isNearShopOwner(player, npc)) {
            this.logger.debug(`[ShopManager] ${player.getName()} is too far from NPC ${npc.getId()} to open the shop`);
            return;
        }

        player.setCurrentShop(shop);
        player.setCurrentShopNpc(npc);

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

    private isNearShopOwner(player: Player, owner: GameEntity) {
        return (
            MathUtil.calcDistance(
                player.getPositionX(),
                player.getPositionY(),
                owner.getPositionX(),
                owner.getPositionY(),
            ) <= SHOP_MAX_DISTANCE
        );
    }

    /**
     * Buy/sell keep working after walking away without this: the shop state
     * stays open on the player until an explicit close. The original refuses
     * transactions beyond 2000 units from the shop owner.
     */
    private isNearCurrentShopNpc(player: Player) {
        const npc = player.getCurrentShopNpc();
        if (!npc) return true;
        return this.isNearShopOwner(player, npc);
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

        if (!this.isNearCurrentShopNpc(player)) {
            player.sendShopResult({ result: ShopSubHeaderGC.INVALID_POS });
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

        const added = player.addItemStacking(item);
        if (!added) {
            player.sendShopResult({ result: ShopSubHeaderGC.INVENTORY_FULL });
            return;
        }

        player.addPoint(PointsEnum.GOLD, -price);
        for (const updated of added.updated) {
            await this.itemManager.update(updated);
        }
        if (added.inserted) {
            await this.itemManager.save(added.inserted);
        }
        await this.itemManager.flush(player.getId());

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

        if (!this.isNearCurrentShopNpc(player)) {
            player.sendShopResult({ result: ShopSubHeaderGC.INVALID_POS });
            return;
        }

        const item = player.getItem(pos);
        if (!item) {
            player.sendShopResult({ result: ShopSubHeaderGC.INVALID_POS });
            return;
        }

        // Cannot sell equipped items (original rejects IsEquipped)
        if (player.getInventory().isFromEquipmentSlots(pos)) {
            player.sendShopResult({ result: ShopSubHeaderGC.INVALID_POS });
            return;
        }

        // Cannot sell items flagged as anti-sell
        if (item.getAntiFlags().is(ItemAntiFlagEnum.ANTI_SELL)) {
            player.sendShopResult({ result: ShopSubHeaderGC.INVALID_POS });
            return;
        }

        // Cannot sell items listed in the player's own open private shop
        if (player.isItemLockedInPrivateShop(item)) {
            player.sendShopResult({ result: ShopSubHeaderGC.INVALID_POS });
            return;
        }

        // count 0 (or more than the stack) means "sell the whole stack",
        // like the original server.
        const stackCount = item.getCount() ?? 1;
        const sellCount = count === 0 || count > stackCount ? stackCount : count;
        const sellPrice = Math.floor((item.getShopPrice() * sellCount) / 5);

        // Refuse the sale when the gold would overflow the cap — the clamp
        // would silently destroy the excess (the original refuses at GOLD_MAX).
        if (player.getPoint(PointsEnum.GOLD) + sellPrice > MathUtil.MAX_UINT) {
            player.sendShopResult({ result: ShopSubHeaderGC.INVALID_POS });
            return;
        }

        if (sellCount === stackCount) {
            // Whole stack sold: remove the item entirely
            player.getInventory().removeItem(pos, item.getSize());
            player.sendItemRemoved({ window: WindowTypeEnum.INVENTORY, position: pos });
            await this.itemManager.delete(item);
        } else {
            // Partial sale: split the stack instead of destroying it
            item.setCount(stackCount - sellCount);
            player.sendItemUpdate(item);
            await this.itemManager.update(item);
            await this.itemManager.flush(player.getId());
        }

        player.addPoint(PointsEnum.GOLD, sellPrice);

        player.sendShopResult({ result: ShopSubHeaderGC.OK });

        this.logger.info(`[ShopManager] Player ${player.getName()} sold pos=${pos} x${sellCount} for ${sellPrice}g`);
    }
}
