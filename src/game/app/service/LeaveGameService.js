export default class LeaveGameService {
    #world;
    #saveCharacterService;

    constructor({ world, saveCharacterService }) {
        this.#world = world;
        this.#saveCharacterService = saveCharacterService;
    }

    async execute(player) {
        this.#world.despawn(player);
        await this.#saveCharacterService.execute(player);
    }
}
