import ChatMessageTypeEnum from '../../../../../core/enum/ChatMessageTypeEnum.js';

export default class ListCommandHandler {
    #logger;
    #world;

    constructor({ logger, world }) {
        this.#logger = logger;
        this.#world = world;
    }

    execute(player, listCommand) {
        if (!listCommand.isValid()) {
            const errors = listCommand.errors();
            this.#logger.error(errors);
            player.sendCommandErrors(errors);
            return;
        }

        const {
            args: [type],
        } = listCommand;

        switch (type) {
            case 'areas': {
                for (const area of this.#world.areas.values()) {
                    if (!area.aka) continue;
                    player.chat({
                        message: `name: ${area.name} | aka: ${area.aka} | x: ${area.positionX} | y: ${area.positionY}`,
                        messageType: ChatMessageTypeEnum.INFO,
                    });
                }
                break;
            }

            case 'players': {
                for (const entity of this.#world.players.values()) {
                    player.chat({
                        message: `name: ${entity.name} | x: ${entity.positionX} | y: ${entity.positionY}`,
                        messageType: ChatMessageTypeEnum.INFO,
                    });
                }
                break;
            }
        }
    }
}
