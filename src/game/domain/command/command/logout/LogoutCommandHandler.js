import ChatMessageTypeEnum from '../../../../../core/enum/ChatMessageTypeEnum.js';

export default class LogoutCommandHandler {
    #logger;
    #world;
    #saveCharacterService;

    constructor({ logger, world, saveCharacterService }) {
        this.#logger = logger;
        this.#world = world;
        this.#saveCharacterService = saveCharacterService;
    }

    async execute(player) {
        this.#logger.info(`[LogoutCommandHandler] Logout account. id: ${player.id}`);
        player.say({
            message: `Logging out`,
            messageType: ChatMessageTypeEnum.INFO,
        });

        this.#world.despawn(player);
        await this.#saveCharacterService.execute(player);
        player.logout();
    }
}
