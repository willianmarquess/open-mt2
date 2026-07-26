import Monster from '@/core/domain/entities/game/mob/Monster';
import Player from '@/core/domain/entities/game/player/Player';
import { EntityManager } from '@/core/domain/manager/EntityManager';
import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
import Logger from '@/core/infra/logger/Logger';

export default class CharacterAttackService {
    private readonly logger: Logger;
    private readonly entityManager: EntityManager;

    constructor({ logger, entityManager }: { logger: Logger; entityManager: EntityManager }) {
        this.logger = logger;
        this.entityManager = entityManager;
    }

    async execute(player: Player, attackType: AttackTypeEnum, victimVirtualId: number) {
        const victim = this.entityManager.getEntity<Player | Monster>(victimVirtualId);

        if (!victim) {
            this.logger.info(`[CharacterAttackService] Victim not found with virtualId ${victimVirtualId}`);
            return;
        }

        player.attack(attackType, victim);
    }
}
