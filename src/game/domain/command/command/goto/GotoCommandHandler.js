import EmpireUtil from '../../../../../core/domain/util/EmpireUtil.js';
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

                let x,
                    y = 0;
                if (areaByName.goto) {
                    const empireName = EmpireUtil.getEmpireName(player.empire);
                    const [posX, posY] = areaByName.goto[empireName] || areaByName.goto.default;
                    x = posX;
                    y = posY;
                } else {
                    x = areaByName.positionX + (areaByName.width * 25600) / 2;
                    y = areaByName.positionY + (areaByName.height * 25600) / 2;
                }

                this.#logger.debug(
                    `[GotoCommandHandler] Teleporting ${player.name} to area: ${areaByName.name}, x: ${x}, y: ${y}`,
                );

                this.#world.despawn(player);
                player.teleport(x, y);
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

                this.#world.despawn(player);
                player.teleport(target.positionX + 200, target.positionY + 200);
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

                this.#world.despawn(player);
                player.teleport(x, y);
                break;
            }
        }
    }
}
