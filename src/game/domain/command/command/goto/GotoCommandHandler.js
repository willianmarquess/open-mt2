import ChatMessageTypeEnum from '../../../../../core/enum/ChatMessageTypeEnum.js';

export default class GotoCommandHandler {
    #logger;
    #world;

    constructor({ logger, world }) {
        this.#logger = logger;
        this.#world = world;
    }

    execute(player, gotoCommand) {
        if (!gotoCommand.isValid()) {
            const errors = gotoCommand.errors();
            this.#logger.error(errors);
            player.sendCommandErrors(errors);
            return;
        }

        const {
            args: [type, ...params],
        } = gotoCommand;

        switch (type) {
            case 'area': {
                const [areaName] = params;
                const areaByName = this.#world.getAreaByName(areaName);

                if (!areaByName) {
                    player.say({
                        message: `Area: ${areaName} not found.`,
                        messageType: ChatMessageTypeEnum.INFO,
                    });
                    return;
                }

                const playerArea = this.#world.getEntityArea(player);

                if (!playerArea) {
                    this.#logger.error(
                        `[GotoCommandHandler] Player area not found, This should not happen, player id: ${player.id}`,
                    );
                    return;
                }

                if (areaByName.name !== playerArea.name) {
                    this.#logger.debug(
                        `[GotoCommandHandler] Teleporting ${player.name} to area: ${areaByName.name}, x: ${areaByName.positionX}, y: ${areaByName.positionY}`,
                    );

                    this.#world.despawn(player);
                    player.teleport(areaByName.positionX, areaByName.positionY);
                    return;
                }

                player.say({
                    message: `You are already in the ${areaName} area`,
                    messageType: ChatMessageTypeEnum.INFO,
                });
                break;
            }

            case 'player': {
                const [targetName] = params;
                const target = this.#world.getPlayerByName(targetName);

                if (!target) {
                    player.say({
                        message: `Target: ${targetName} not found.`,
                        messageType: ChatMessageTypeEnum.INFO,
                    });
                    return;
                }

                console.log(target);

                break;
            }

            case 'location': {
                const [x, y] = params;
                const areaByLocation = this.#world.getAreaByCoordinates(x, y);

                if (!areaByLocation) {
                    player.say({
                        message: `Area in x: ${x} and y: ${y} not found.`,
                        messageType: ChatMessageTypeEnum.INFO,
                    });
                    return;
                }

                console.log(areaByLocation);
                break;
            }
        }
    }
}
