import ShopService from '@/game/app/service/ShopService';
import NPC from '../../entities/game/mob/NPC';
import Player from '../../entities/game/player/Player';

export class NpcQuest {
    private readonly npc: NPC;
    private readonly shopService: ShopService;
    private readonly player: Player;

    constructor({ npc, shopService, player }: { npc: NPC; shopService: ShopService; player: Player }) {
        this.npc = npc;
        this.shopService = shopService;
        this.player = player;
    }

    getLevel() {
        return this.npc.getLevel();
    }

    getId() {
        return this.npc.getId();
    }

    async openShop(shopId: number) {
        await this.shopService.openShop(this.player, this.npc, shopId);
    }
}
