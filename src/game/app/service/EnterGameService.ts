import Player from '@/core/domain/entities/game/player/Player';
import World from '@/core/domain/World';

export default class EnterGameService {
    private readonly world: World;

    constructor({ world }) {
        this.world = world;
    }

    execute(player: Player) {
        player.spawn();
        this.world.spawn(player);
        player.sendInventory();
    }
}
