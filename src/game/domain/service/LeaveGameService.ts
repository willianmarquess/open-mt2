import Player from '@/core/domain/entities/game/player/Player';
import World from '@/core/domain/World';

export default class LeaveGameService {
    private readonly world: World;

    constructor({ world }) {
        this.world = world;
    }

    async execute(player: Player) {
        this.world.despawn(player);
    }
}
