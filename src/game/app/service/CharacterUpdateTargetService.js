export default class CharacterUpdateTargetService {
    #logger;
    #world;

    constructor({ logger, world }) {
        this.#logger = logger;
        this.#world = world;
    }

    async execute({ player, targetVirtualId }) {
        const area = this.#world.getAreaByCoordinates(player.positionX, player.positionY);

        if (!area) {
            this.#logger.info(
                `[CharacterUpdateTargetService] Area not found at x: ${player.positionX}, y: ${player.positionY}`,
            );
            return;
        }

        const target = area.getEntity(targetVirtualId);

        if (!target) {
            this.#logger.info(`[CharacterUpdateTargetService] Target not found with virtualId ${targetVirtualId}`);
            return;
        }

        player.setTarget(target);
    }
}
