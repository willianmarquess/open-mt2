import Player from '@/core/domain/entities/game/player/Player';
import World from '@/core/domain/World';
import { QuestManager } from '@/core/domain/quests/QuestManager';
import PrivateShopService from '@/game/app/service/PrivateShopService';

export default class LeaveGameService {
    private readonly world: World;
    private readonly privateShopService: PrivateShopService;
    private readonly questManager: QuestManager;

    constructor({
        world,
        privateShopService,
        questManager,
    }: {
        world: World;
        privateShopService: PrivateShopService;
        questManager: QuestManager;
    }) {
        this.world = world;
        this.privateShopService = privateShopService;
        this.questManager = questManager;
    }

    async execute(player: Player) {
        // Close the player's own private shop: without this, guests keep
        // buying from the offline owner's stale in-memory inventory, and a
        // relog creates a second live copy of every item (duplication).
        await this.privateShopService.closePrivateShop(player);

        // Leave any private shop the player was browsing so the owner's
        // guest list doesn't accumulate dead connections.
        const browsedOwner = player.getCurrentPrivateShopOwner();
        if (browsedOwner) {
            browsedOwner.getPrivateShop()?.removeGuest(player);
            player.setCurrentPrivateShopOwner(null);
        }

        await this.questManager.onLogout(player);

        await player.flushSave();

        this.world.despawn(player);
    }
}
