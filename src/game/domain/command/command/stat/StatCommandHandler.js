import ChatMessageTypeEnum from '../../../../../core/enum/ChatMessageTypeEnum.js';

export default class StatCommandHandler {
    #logger;

    constructor({ logger }) {
        this.#logger = logger;
    }

    execute(player, statCommand) {
        if (!statCommand.isValid) {
            this.#logger.error(statCommand.errors);
            player.say({
                message: `Invalid command format`,
                messageType: ChatMessageTypeEnum.INFO,
            });
        }

        //const { args } = statCommand;
        //todo
    }
}
