import ChatMessageTypeEnum from '../../../../../core/enum/ChatMessageTypeEnum.js';

export default class QuitCommandHandler {
    #logger;

    constructor({ logger }) {
        this.#logger = logger;
    }

    async execute(player) {
        this.#logger.info(`[QuitCommandHandler] Quit client. id: ${player.id}`);
        player.say({
            message: `Quitting game`,
            messageType: ChatMessageTypeEnum.INFO,
        });
        player.say({
            message: 'quit',
            messageType: ChatMessageTypeEnum.COMMAND,
        });
    }
}
