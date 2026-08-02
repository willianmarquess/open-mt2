import Logger from '@/core/infra/logger/Logger';
import CommandHandler from '../../CommandHandler';
import SkillUpCommand from './SkillUpCommand';
import Player from '@/core/domain/entities/game/player/Player';

export default class SkillUpCommandHandler extends CommandHandler<SkillUpCommand> {
    private readonly logger: Logger;

    constructor({ logger }: { logger: Logger }) {
        super();
        this.logger = logger;
    }

    async execute(player: Player, skillUpCommand: SkillUpCommand) {
        if (!skillUpCommand.isValid()) {
            const errors = skillUpCommand.errors();
            this.logger.error(skillUpCommand.getErrorMessage());
            player.sendCommandErrors(errors);
            return;
        }

        const [id] = skillUpCommand.getArgs();

        player.skillLevelUpByPoint(Number(id));
    }
}
