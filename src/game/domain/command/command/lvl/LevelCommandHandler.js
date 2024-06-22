import ChatMessageTypeEnum from '../../../../../core/enum/ChatMessageTypeEnum.js';

export default class LevelCommandHandler {
    #logger;
    #world;

    constructor({ logger, world }) {
        this.#logger = logger;
        this.#world = world;
    }

    execute(player, levelCommand) {
        if (!levelCommand.isValid()) {
            const errors = levelCommand.errors();
            this.#logger.error(errors);
            player.sendCommandErrors(errors);
            return;
        }

        const {
            args: [value, targetName],
        } = levelCommand;

        if (!targetName) {
            player.setLevel(value);
            return;
        }

        const target = this.#world.getPlayerByName(targetName);

        if (!target) {
            player.say({
                message: `Target: ${targetName} not found.`,
                messageType: ChatMessageTypeEnum.INFO,
            });
        }

        target.setLevel(value);
    }
}
