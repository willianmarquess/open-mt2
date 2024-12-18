import Player from "@/core/domain/entities/game/player/Player";
import ItemManager from "@/core/domain/manager/ItemManager";
import PlayerRepository from "@/game/infra/database/PlayerRepository";

export default class SaveCharacterService {
    private readonly playerRepository: PlayerRepository;
    private readonly itemManager: ItemManager;

    constructor({ playerRepository, itemManager }) {
        this.playerRepository = playerRepository;
        this.itemManager = itemManager;
    }

    async execute(player: Player) {
        return Promise.all([this.playerRepository.update(player.toDatabase()), this.itemManager.flush(player.getId())]);
    }
}
