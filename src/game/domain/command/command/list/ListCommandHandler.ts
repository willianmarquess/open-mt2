import Logger from "@/core/infra/logger/Logger";
import CommandHandler from "../../CommandHandler";
import ListCommand from "./ListCommand";
import World from "@/core/domain/World";
import Player from "@/core/domain/entities/game/player/Player";
import { ChatMessageTypeEnum } from "@/core/enum/ChatMessageTypeEnum";

export default class ListCommandHandler extends CommandHandler<ListCommand> {
    private readonly logger: Logger;
    private readonly world: World;

    constructor({ logger, world }) {
        super();
        this.logger = logger;
        this.world = world;
    }

    async execute(player: Player, listCommand: ListCommand) {
        if (!listCommand.isValid()) {
            const errors = listCommand.errors();
            this.logger.error(listCommand.getErrorMessage());
            player.sendCommandErrors(errors);
            return;
        }

        const [type] = listCommand.getArgs();

        switch (type) {
            case 'areas': {
                for (const area of this.world.getAreas().values()) {
                    if (!area.getAka()) continue;
                    player.chat({
                        message: `name: ${area.getName()} | aka: ${area.getAka()} | x: ${area.getPositionX()} | y: ${area.getPositionY()}`,
                        messageType: ChatMessageTypeEnum.INFO,
                    });
                }
                break;
            }

            case 'players': {
                for (const entity of this.world.getPlayers().values()) {
                    player.chat({
                        message: `name: ${entity.getName()} | x: ${entity.getPositionX()} | y: ${entity.getPositionY()}`,
                        messageType: ChatMessageTypeEnum.INFO,
                    });
                }
                break;
            }
        }
    }
}
