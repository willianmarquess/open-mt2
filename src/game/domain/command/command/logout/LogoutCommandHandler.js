import ChatMessageTypeEnum from '../../../../../core/enum/ChatMessageTypeEnum.js';

export default class LogoutCommandHandler {
    #logger;
    #leaveGameService;

    constructor({ logger, leaveGameService }) {
        this.#logger = logger;
        this.#leaveGameService = leaveGameService;
    }

    async execute(player) {
        this.#logger.info(`[LogoutCommandHandler] Logout account. id: ${player.id}`);
        player.say({
            message: `Logging out`,
            messageType: ChatMessageTypeEnum.INFO,
        });
        await this.#leaveGameService.execute(player);
        player.logout();
    }
}
