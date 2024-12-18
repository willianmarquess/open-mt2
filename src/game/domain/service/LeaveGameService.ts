import Player from '@/core/domain/entities/game/player/Player';
import World from '@/core/domain/World';
import SaveCharacterService from './SaveCharacterService';

export default class LeaveGameService {
    private readonly world: World;
    private readonly saveCharacterService: SaveCharacterService;

    constructor({ world, saveCharacterService }) {
        this.world = world;
        this.saveCharacterService = saveCharacterService;
    }

    async execute(player: Player) {
        this.world.despawn(player);
        await this.saveCharacterService.execute(player);
    }
}
