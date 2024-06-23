import ChatMessageTypeEnum from '../../../../../core/enum/ChatMessageTypeEnum.js';

export default class GoldCommandHandler {
    #logger;
    #world;

    constructor({ logger, world }) {
        this.#logger = logger;
        this.#world = world;
    }

    execute(player, goldCommand) {
        if (!goldCommand.isValid()) {
            const errors = goldCommand.errors();
            this.#logger.error(errors);
            player.sendCommandErrors(errors);
            return;
        }

        const {
            args: [value, targetName],
        } = goldCommand;

        if (!targetName) {
            player.addGold(value);
            return;
        }

        const target = this.#world.getPlayerByName(targetName);

        if (!target) {
            player.say({
                message: `Target: ${targetName} not found.`,
                messageType: ChatMessageTypeEnum.INFO,
            });
            return;
        }

        target.addGold(value);
    }
}
