import Shop from '@/core/domain/shop/Shop';
import { ShopItem } from '@/core/domain/shop/ShopItem';
import Logger from '@/core/infra/logger/Logger';
import ItemManager from '@/core/domain/manager/ItemManager';
import { GameConfig } from '@/game/infra/config/GameConfig';

type ShopManagerParams = {
    config: GameConfig;
    logger: Logger;
    itemManager: ItemManager;
};

export default class ShopManager {
    private readonly config: GameConfig;
    private readonly logger: Logger;
    private readonly itemManager: ItemManager;

    // vnum → Shop (NPC shops loaded from config)
    private readonly shops: Map<number, Shop> = new Map();

    constructor({ config, logger, itemManager }: ShopManagerParams) {
        this.config = config;
        this.logger = logger;
        this.itemManager = itemManager;
    }

    load() {
        this.config.npcShops.forEach((shopEntry) => {
            const shopItems: ShopItem[] = [];

            shopEntry.items.forEach(({ vnum, count }) => {
                const item = this.itemManager.getItem(vnum, count);
                if (!item) {
                    this.logger.info(`[ShopManager] Unknown item vnum ${vnum} in shop for NPC ${shopEntry.npcVnum}`);
                    return;
                }

                shopItems.push({
                    vnum,
                    count,
                    price: item.getShopPrice(),
                    item,
                });
            });

            const shop = new Shop({
                npcVnum: shopEntry.npcVnum,
                shopName: shopEntry.shopName,
                items: shopItems,
            });

            this.shops.set(shopEntry.npcVnum, shop);
            this.logger.info(
                `[ShopManager] Loaded shop for NPC vnum ${shopEntry.npcVnum} "${shopEntry.shopName}" with ${shopItems.length} item(s)`,
            );
        });
    }

    hasShop(npcVnum: number): boolean {
        return this.shops.has(npcVnum);
    }

    getShop(npcVnum: number): Shop | undefined {
        return this.shops.get(npcVnum);
    }
}
