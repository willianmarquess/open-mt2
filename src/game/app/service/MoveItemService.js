export default class MoveItemService {
    #logger;

    constructor({ logger }) {
        this.#logger = logger;
    }

    async execute({ player, fromWindow, fromPosition, toWindow, toPosition, count }) {
        this.#logger.debug(`[MoveItemService] moving item from ${fromPosition} to ${toPosition}`);
        player.moveItem({ fromWindow, fromPosition, toWindow, toPosition, count });
    }
}
