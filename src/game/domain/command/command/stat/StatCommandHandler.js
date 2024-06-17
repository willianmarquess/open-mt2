export default class StatCommandHandler {
    #logger;

    constructor({ logger }) {
        this.#logger = logger;
    }

    execute(player, statCommand) {
        if (!statCommand.isValid()) {
            const errors = statCommand.errors();
            this.#logger.error(errors);
            player.sendCommandErrors(errors);
            return;
        }

        const {
            args: [stat, value],
        } = statCommand;
        player.addStat(stat, value);
    }
}
