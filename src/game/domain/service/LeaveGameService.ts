import Player from '@/core/domain/entities/game/player/Player';
import World from '@/core/domain/World';
import PrivateShopService from '@/game/app/service/PrivateShopService';

export default class LeaveGameService {
    private readonly world: World;
    private readonly privateShopService: PrivateShopService;

    constructor({ world, privateShopService }: { world: World; privateShopService: PrivateShopService }) {
        this.world = world;
        this.privateShopService = privateShopService;
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

        await player.flushSave();
        this.world.despawn(player);
    }
}
