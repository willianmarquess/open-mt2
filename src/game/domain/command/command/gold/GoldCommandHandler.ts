import Logger from "@/core/infra/logger/Logger";
import CommandHandler from "../../CommandHandler";
import GoldCommand from "./GoldCommand";
import World from "@/core/domain/World";
import Player from "@/core/domain/entities/game/player/Player";
import { ChatMessageTypeEnum } from "@/core/enum/ChatMessageTypeEnum";

export default class GoldCommandHandler extends CommandHandler<GoldCommand> {
    private readonly logger: Logger;
    private readonly world: World;

    constructor({ logger, world }) {
        super();
        this.logger = logger;
        this.world = world;
    }

    async execute(player: Player, goldCommand: GoldCommand) {
        if (!goldCommand.isValid()) {
            const errors = goldCommand.errors();
            this.logger.error(goldCommand.getErrorMessage());
            player.sendCommandErrors(errors);
            return;
        }

        const [value, targetName] = goldCommand.getArgs();

        if (!targetName) {
            player.addGold(Number(value));
            return;
        }

        const target = this.world.getPlayerByName(targetName);

        if (!target) {
            player.chat({
                message: `Target: ${targetName} not found.`,
                messageType: ChatMessageTypeEnum.INFO,
            });
            return;
        }

        target.addGold(Number(value));
    }
}
