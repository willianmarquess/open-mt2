import Player from '@/core/domain/entities/game/player/Player';
import World from '@/core/domain/World';

export default class EnterGameService {
    private readonly world: World;

    constructor({ world }: { world: World }) {
        this.world = world;
    }

    execute(player: Player) {
        this.world.spawn(player);
    }
}
