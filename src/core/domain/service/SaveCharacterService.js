export default class SaveCharacterService {
    #playerRepository;

    constructor({ playerRepository }) {
        this.#playerRepository = playerRepository;
    }

    async execute(player) {
        return this.#playerRepository.update(player.toDatabase());
    }
}
