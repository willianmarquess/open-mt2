import type ShopManager from '@/core/domain/shop/ShopManager';
import type NPC from '../../entities/game/mob/NPC';
import type Player from '../../entities/game/player/Player';

export class NpcQuest {
    private readonly npc: NPC;
    private readonly shopManager: ShopManager;
    private readonly player: Player;

    constructor({ npc, shopManager, player }: { npc: NPC; shopManager: ShopManager; player: Player }) {
        this.npc = npc;
        this.shopManager = shopManager;
        this.player = player;
    }

    getLevel() {
        return this.npc.getLevel();
    }

    getId() {
        return this.npc.getId();
    }

    getVirtualId() {
        return this.npc.getVirtualId();
    }

    isMine() {
        const spawnedHorse = this.player.getSpawnedHorse();
        return spawnedHorse !== null && spawnedHorse.getVirtualId() === this.npc.getVirtualId();
    }

    async openShop(shopId: number) {
        await this.shopManager.openShop(this.npc, this.player, shopId);
    }
}
