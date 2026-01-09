import Player from '@/core/domain/entities/game/player/Player';
import ItemManager from '@/core/domain/manager/ItemManager';
import { IPlayerRepository } from '../../../core/domain/repository/IPlayerRepository';

export default class SaveCharacterService {
    private readonly playerRepository: IPlayerRepository;
    private readonly itemManager: ItemManager;

    constructor({ playerRepository, itemManager }) {
        this.playerRepository = playerRepository;
        this.itemManager = itemManager;
    }

    async execute(player: Player) {
        return Promise.allSettled([
            this.playerRepository.update(player.toDatabase()),
            this.itemManager.flush(player.getId()),
        ]);
    }
}
