export default class CharacterAttackService {
    #logger;
    #world;

    constructor({ logger, world }) {
        this.#logger = logger;
        this.#world = world;
    }

    async execute({ player, attackType, victimVirtualId }) {
        const area = this.#world.getAreaByCoordinates(player.positionX, player.positionY);

        if (!area) {
            this.#logger.info(
                `[CharacterAttackService] Area not found at x: ${player.positionX}, y: ${player.positionY}`,
            );
            return;
        }

        const victim = area.getEntity(victimVirtualId);

        if (!victim) {
            this.#logger.info(`[CharacterAttackService] Victim not found with virtualId ${victimVirtualId}`);
            return;
        }

        player.attack(victim, attackType);
    }
}
