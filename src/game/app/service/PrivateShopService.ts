import Player from '@/core/domain/entities/game/player/Player';
import Logger from '@/core/infra/logger/Logger';
import { ItemAntiFlagEnum } from '@/core/enum/ItemAntiFlagEnum';
import { ShopSubHeaderGC } from '@/core/enum/ShopSubHeaderEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { WindowTypeEnum } from '@/core/enum/WindowTypeEnum';
import PrivateShop, { PrivateShopItem } from '@/core/domain/shop/PrivateShop';
import { MyShopItemEntry } from '@/core/interface/networking/packets/packet/in/myshop/MyShopPacket';
import ItemManager from '@/core/domain/manager/ItemManager';

/** Maximum yang price a seller can set per item. */
const MAX_ITEM_PRICE = 2_000_000_000;

export default class PrivateShopService {
    private readonly itemManager: ItemManager;
    private readonly logger: Logger;

    constructor({ itemManager, logger }: { itemManager: ItemManager; logger: Logger }) {
        this.itemManager = itemManager;
        this.logger = logger;
    }

    /**
     * Opens a private shop for the given player.
     * Validates each item against ANTI_MYSHOP and missing inventory entries,
     * then broadcasts GC_SHOP_SIGN to the owner and all nearby players.
     */
    async openPrivateShop(player: Player, sign: string, itemEntries: MyShopItemEntry[]) {
        if (player.isRunningPrivateShop()) {
            this.logger.debug(`[PrivateShopService] ${player.getName()} tried to open a shop but already has one open`);
            return;
        }

        if (player.getCurrentShop()) {
            this.logger.debug(
                `[PrivateShopService] ${player.getName()} tried to open a shop while browsing an NPC shop`,
            );
            return;
        }

        const shopItems: PrivateShopItem[] = [];
        const seenDisplayPos = new Set<number>();
        const seenCellIndex = new Set<number>();

        for (const entry of itemEntries) {
            if (seenDisplayPos.has(entry.displayPos)) {
                this.logger.debug(
                    `[PrivateShopService] openPrivateShop: duplicate displayPos ${entry.displayPos}, skipping`,
                );
                continue;
            }

            if (seenCellIndex.has(entry.cellIndex)) {
                this.logger.debug(
                    `[PrivateShopService] openPrivateShop: duplicate cellIndex ${entry.cellIndex}, skipping`,
                );
                continue;
            }

            const item = player.getItem(entry.cellIndex);
            if (!item) {
                this.logger.debug(`[PrivateShopService] openPrivateShop: item not found at slot ${entry.cellIndex}`);
                continue;
            }

            if (item.getAntiFlags().is(ItemAntiFlagEnum.ANTI_MYSHOP)) {
                this.logger.debug(
                    `[PrivateShopService] openPrivateShop: item at slot ${entry.cellIndex} has ANTI_MYSHOP flag`,
                );
                continue;
            }

            if (entry.price < 1) {
                this.logger.debug(
                    `[PrivateShopService] openPrivateShop: item at slot ${entry.cellIndex} has invalid price ${entry.price}`,
                );
                continue;
            }

            const price = Math.min(entry.price, MAX_ITEM_PRICE);

            seenDisplayPos.add(entry.displayPos);
            seenCellIndex.add(entry.cellIndex);

            shopItems.push({
                displayPos: entry.displayPos,
                inventoryPos: entry.cellIndex,
                price,
                item,
            });
        }

        if (shopItems.length === 0) {
            this.logger.debug(`[PrivateShopService] ${player.getName()} tried to open an empty/invalid private shop`);
            return;
        }

        const privateShop = new PrivateShop({ owner: player, sign, items: shopItems });
        player.setPrivateShop(privateShop);

        this.logger.debug(
            `[PrivateShopService] ${player.getName()} opened private shop "${sign}" (${shopItems.length} item(s))`,
        );

        // Consume the first Bundle (vnum 50200) from the owner's inventory
        await this.consumeBundle(player);

        this.broadcastShopSign(player, sign);
    }

    /**
     * Closes the owner's private shop.
     * Kicks all current guests and broadcasts sign removal to nearby players.
     */
    async closePrivateShop(player: Player) {
        const shop = player.getPrivateShop();
        if (!shop) return;

        // Kick all guests: send them a SHOP_END and clear their browsing state
        for (const guest of shop.getGuests()) {
            guest.setCurrentPrivateShopOwner(null);
            guest.sendShopClose();
        }

        player.setPrivateShop(null);

        // Send SHOP_END to the owner to close the shop UI on their client
        player.sendShopClose();

        this.logger.debug(`[PrivateShopService] ${player.getName()} closed their private shop`);

        // Broadcast empty sign to remove the shop marker for nearby players
        this.broadcastShopSign(player, '');
    }

    /**
     * Called when the owner clicks themselves while the shop is running.
     * Re-sends the shop listing to the owner so the management UI opens.
     */
    async openShopForOwner(owner: Player) {
        const shop = owner.getPrivateShop();
        if (!shop) return;

        const shopItemsForPacket = shop.getItemsAsArray().map((entry) => {
            if (!entry) return undefined;
            return {
                vnum: entry.item.getId(),
                count: entry.item.getCount() ?? 1,
                price: entry.price,
                item: entry.item,
                displayPos: entry.displayPos,
            };
        });

        owner.sendCurrentShop({
            ownerVid: owner.getVirtualId(),
            items: shopItemsForPacket as any,
        });

        this.logger.debug(`[PrivateShopService] ${owner.getName()} re-opened their own private shop UI`);
    }

    /**
     * Called when another player clicks a player who has an open private shop.
     * Sends the shop's item listing to the guest.
     */
    async openShopForGuest(guest: Player, owner: Player) {
        const shop = owner.getPrivateShop();
        if (!shop) return;

        // Cannot browse while running own shop
        if (guest.isRunningPrivateShop()) return;

        // Close any previously open NPC shop for the guest first
        if (guest.getCurrentShop()) {
            guest.setCurrentShop(null);
            guest.sendShopClose();
        }

        // Close any previously open private shop browsing session (unless it's the same shop)
        const prevOwner = guest.getCurrentPrivateShopOwner();
        if (prevOwner && prevOwner !== owner) {
            prevOwner.getPrivateShop()?.removeGuest(guest);
            guest.setCurrentPrivateShopOwner(null);
            guest.sendShopClose();
        }

        // Already browsing this same shop - just re-send the listing
        shop.addGuest(guest);
        guest.setCurrentPrivateShopOwner(owner);

        const shopItemsForPacket = shop.getItemsAsArray().map((entry) => {
            if (!entry) return undefined;
            return {
                vnum: entry.item.getId(),
                count: entry.item.getCount() ?? 1,
                price: entry.price,
                item: entry.item,
                displayPos: entry.displayPos,
            };
        });

        guest.sendCurrentShop({
            ownerVid: owner.getVirtualId(),
            items: shopItemsForPacket,
        });

        this.logger.debug(`[PrivateShopService] ${guest.getName()} opened private shop of ${owner.getName()}`);
    }

    /**
     * Handles a BUY request from a guest browsing a private shop.
     * Transfers the item from owner's inventory to the buyer's inventory and moves yang.
     */
    async buy(guest: Player, displaySlot: number) {
        const owner = guest.getCurrentPrivateShopOwner();
        if (!owner) {
            guest.sendShopResult({ result: ShopSubHeaderGC.INVALID_POS });
            return;
        }

        const shop = owner.getPrivateShop();
        if (!shop) {
            // Shop was closed while guest was browsing
            guest.setCurrentPrivateShopOwner(null);
            guest.sendShopClose();
            return;
        }

        const entry = shop.getItemAtDisplaySlot(displaySlot);
        if (!entry) {
            guest.sendShopResult({ result: ShopSubHeaderGC.INVALID_POS });
            return;
        }

        const price = entry.price;
        if (guest.getPoint(PointsEnum.GOLD) < price) {
            guest.sendShopResult({ result: ShopSubHeaderGC.NOT_ENOUGH_MONEY });
            return;
        }

        const item = entry.item;

        // Verify the item is still in the owner's inventory at the expected slot
        const ownerItem = owner.getItem(entry.inventoryPos);
        if (ownerItem?.getId() !== item.getId()) {
            shop.removeItemAtDisplaySlot(displaySlot);
            guest.sendShopResult({ result: ShopSubHeaderGC.SOLD_OUT });
            return;
        }

        // Remove item from owner's inventory
        owner.getInventory().removeItem(entry.inventoryPos, item.getSize());
        owner.sendItemRemoved({ window: WindowTypeEnum.INVENTORY, position: entry.inventoryPos });

        // Add item to buyer's inventory
        if (!guest.addItem(item)) {
            // Rollback: restore the item to the owner
            owner.getInventory().addItemAt(item, entry.inventoryPos);
            owner.sendItemAdded({ window: WindowTypeEnum.INVENTORY, position: entry.inventoryPos, item });
            guest.sendShopResult({ result: ShopSubHeaderGC.INVENTORY_FULL });
            return;
        }

        // Transfer yang
        guest.addPoint(PointsEnum.GOLD, -price);
        owner.addPoint(PointsEnum.GOLD, price);

        // Persist item ownership change
        await this.itemManager.save(item);

        // Remove entry from shop and notify all guests that this slot is now empty
        shop.removeItemAtDisplaySlot(displaySlot);
        this.broadcastUpdateItem(shop, displaySlot);

        guest.sendShopResult({ result: ShopSubHeaderGC.OK });

        this.logger.info(
            `[PrivateShopService] ${guest.getName()} bought slot ${displaySlot} from ${owner.getName()} for ${price}g`,
        );

        // Close shop automatically when all items have been sold
        if (shop.isEmpty()) {
            await this.closePrivateShop(owner);
        }
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /** Broadcasts GC_SHOP_SIGN to the shop owner and all nearby players. */
    private broadcastShopSign(owner: Player, sign: string) {
        const params = { ownerVid: owner.getVirtualId(), sign };

        owner.sendShopSign(params);

        for (const entity of owner.getNearbyEntities().values()) {
            if (entity instanceof Player) {
                entity.sendShopSign(params);
            }
        }
    }

    /**
     * Broadcasts GC_SHOP / SHOP_SUBHEADER_GC_UPDATE_ITEM to all current guests
     * when a slot becomes empty after a sale.
     */
    private broadcastUpdateItem(shop: PrivateShop, displaySlot: number) {
        for (const guest of shop.getGuests()) {
            guest.sendShopUpdateItem({ pos: displaySlot });
        }
    }

    /** Consumes one Bundle (vnum 50200) from the player's inventory. Decrements the stack; deletes if last. */
    private async consumeBundle(player: Player) {
        const BUNDLE_VNUM = 50200;
        const bundle = Array.from(player.getInventory().getItems().values()).find(
            (item) => item?.getId() === BUNDLE_VNUM,
        );

        if (!bundle) return;

        if (bundle.getCount() > 1) {
            bundle.decreaseCount(1);
            player.sendItemUpdate(bundle);
            await this.itemManager.save(bundle);
        } else {
            const position = bundle.getPosition();
            player.getInventory().removeItem(position, bundle.getSize());
            player.sendItemRemoved({ window: bundle.getWindow(), position });
            await this.itemManager.delete(bundle);
        }
    }
}
