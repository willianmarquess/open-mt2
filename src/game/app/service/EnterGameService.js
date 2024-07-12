export default class EnterGameService {
    #world;

    constructor({ world }) {
        this.#world = world;
    }

    execute({ player }) {
        player.spawn();
        this.#world.spawn(player);
        player.sendInventory();
    }
}
