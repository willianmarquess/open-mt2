export default class SaveCharacterService {
    #playerRepository;
    #itemManager;

    constructor({ playerRepository, itemManager }) {
        this.#playerRepository = playerRepository;
        this.#itemManager = itemManager;
    }

    async execute(player) {
        return Promise.all([this.#playerRepository.update(player.toDatabase()), this.#itemManager.flush(player.id)]);
    }
}
