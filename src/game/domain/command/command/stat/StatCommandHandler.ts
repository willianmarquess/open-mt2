import Logger from "@/core/infra/logger/Logger";
import CommandHandler from "../../CommandHandler";
import StatCommand from "./StatCommand";
import Player from "@/core/domain/entities/game/player/Player";
import { StatsEnum } from "@/core/enum/StatsEnum";

export default class StatCommandHandler extends CommandHandler<StatCommand>{
    private readonly logger: Logger;

    constructor({ logger }) {
        super();
        this.logger = logger;
    }

    async execute(player: Player, statCommand: StatCommand) {
        if (!statCommand.isValid()) {
            const errors = statCommand.errors();
            this.logger.error(statCommand.getErrorMessage());
            player.sendCommandErrors(errors);
            return;
        }

        const [stat, value] = statCommand.getArgs();
        player.addStat(stat as StatsEnum, Number(value));
    }
}
