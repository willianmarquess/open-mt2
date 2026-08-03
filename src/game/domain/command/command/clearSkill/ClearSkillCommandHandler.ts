import Logger from '@/core/infra/logger/Logger';
import CommandHandler from '../../CommandHandler';
import Player from '@/core/domain/entities/game/player/Player';
import ClearSkillCommand from './ClearSkillCommand';
import { EntityManager } from '@/core/domain/manager/EntityManager';

export default class ClearSkillCommandHandler extends CommandHandler<ClearSkillCommand> {
    private readonly logger: Logger;
    private readonly entityManager: EntityManager;

    constructor({ logger, entityManager }: { logger: Logger; entityManager: EntityManager }) {
        super();
        this.logger = logger;
        this.entityManager = entityManager;
    }

    async execute(player: Player, clearSkillCommand: ClearSkillCommand) {
        if (!clearSkillCommand.isValid()) {
            const errors = clearSkillCommand.errors();
            this.logger.error(clearSkillCommand.getErrorMessage());
            player.sendCommandErrors(errors);
            return;
        }

        const [name] = clearSkillCommand.getArgs();

        let targetPlayer: Player | null = player;

        if (name) {
            targetPlayer = this.entityManager.getPlayerByName(name);
            if (!targetPlayer) {
                player.sendCommandErrors([{ message: `Player ${name} not found.` }]);
                return;
            }
        }

        targetPlayer.clearSkill();
    }
}
