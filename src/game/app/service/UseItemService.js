export default class UseItemService {
    #logger;

    constructor({ logger }) {
        this.#logger = logger;
    }

    async execute({ player, window, position }) {
        this.#logger.debug(`[UseItemService] using item in window: ${window}, position: ${position}`);
        player.useItem({ window, position });
    }
}
