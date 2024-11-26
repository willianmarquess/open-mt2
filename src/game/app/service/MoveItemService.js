export default class MoveItemService {
    #logger;
    #itemManager;

    constructor({ logger, itemManager }) {
        this.#logger = logger;
        this.#itemManager = itemManager;
    }

    async execute({ player, fromWindow, fromPosition, toWindow, toPosition /*count*/ }) {
        this.#logger.debug(`[MoveItemService] moving item from ${fromPosition} to ${toPosition}`);

        const updatedItem = player.moveItem({ fromWindow, fromPosition, toWindow, toPosition });

        if (updatedItem) {
            await this.#itemManager.update(updatedItem);
        }
    }
}
