import Logger from '@/core/infra/logger/Logger';
import CommandHandler from '../../CommandHandler';
import Player from '@/core/domain/entities/game/player/Player';
import ClearSkillGroupCommand from './ClearSkillGroupCommand';
import { EntityManager } from '@/core/domain/manager/EntityManager';

export default class ClearSkillGroupCommandHandler extends CommandHandler<ClearSkillGroupCommand> {
    private readonly logger: Logger;
    private readonly entityManager: EntityManager;

    constructor({ logger, entityManager }: { logger: Logger; entityManager: EntityManager }) {
        super();
        this.logger = logger;
        this.entityManager = entityManager;
    }

    async execute(player: Player, clearSkillGroupCommand: ClearSkillGroupCommand) {
        if (!clearSkillGroupCommand.isValid()) {
            const errors = clearSkillGroupCommand.errors();
            this.logger.error(clearSkillGroupCommand.getErrorMessage());
            player.sendCommandErrors(errors);
            return;
        }

        const [name] = clearSkillGroupCommand.getArgs();

        let targetPlayer: Player | null = player;

        if (name) {
            targetPlayer = this.entityManager.getPlayerByName(name);
            if (!targetPlayer) {
                player.sendCommandErrors([{ message: `Player ${name} not found.` }]);
                return;
            }
        }

        targetPlayer.clearSkillGroup();
    }
}
