import ChatMessageTypeEnum from '../../../../../core/enum/ChatMessageTypeEnum.js';

export default class ExperienceCommandHandler {
    #logger;
    #world;

    constructor({ logger, world }) {
        this.#logger = logger;
        this.#world = world;
    }

    execute(player, experienceCommand) {
        if (!experienceCommand.isValid()) {
            const errors = experienceCommand.errors();
            this.#logger.error(errors);
            player.sendCommandErrors(errors);
            return;
        }

        const {
            args: [value, targetName],
        } = experienceCommand;

        if (!targetName) {
            player.addExperience(value);
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

        target.addExperience(value);
    }
}
