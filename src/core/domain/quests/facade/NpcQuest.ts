import ShopManager from '@/core/domain/shop/ShopManager';
import NPC from '../../entities/game/mob/NPC';
import Player from '../../entities/game/player/Player';

export class NpcQuest {
    private readonly npc: NPC;
    private readonly shopManager: ShopManager;
    private readonly player: Player;

    constructor({ npc, shopService, player }: { npc: NPC; shopService: ShopManager; player: Player }) {
        this.npc = npc;
        this.shopManager = shopService;
        this.player = player;
    }

    getLevel() {
        return this.npc.getLevel();
    }

    getId() {
        return this.npc.getId();
    }

    async openShop(shopId: number) {
        await this.shopManager.openShop(this.npc, this.player, shopId);
    }
}
