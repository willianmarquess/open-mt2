import Logger from '@/core/infra/logger/Logger';
import CommandHandler from '../../CommandHandler';
import StatCommand from './StatCommand';
import Player from '@/core/domain/entities/game/player/Player';
import { StatsEnum } from '@/core/enum/StatsEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';

export default class StatCommandHandler extends CommandHandler<StatCommand> {
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

        const [stat, value = 1] = statCommand.getArgs();
        switch (stat as StatsEnum) {
            case StatsEnum.DX:
                player.addPoint(PointsEnum.DX, Number(value));
                break;
            case StatsEnum.HT:
                player.addPoint(PointsEnum.HT, Number(value));
                break;
            case StatsEnum.IQ:
                player.addPoint(PointsEnum.IQ, Number(value));
                break;
            case StatsEnum.ST:
                player.addPoint(PointsEnum.ST, Number(value));
                break;

            default:
                this.logger.error(`[StatCommandHandler] Invalid stat ${stat}`);
                break;
        }
    }
}
