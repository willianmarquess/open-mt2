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
        const victim = this.entityManager.getEntity(victimVirtualId);

        // Only players and monsters can be attacked. A client can send any VID
        // it has in view (including dropped items, which are GameEntity but not
        // Character), and getEntity's generic is only a cast — so validate the
        // real type before the damage pipeline calls methods like isDead() that
        // only exist on attackable entities. Without this a crafted VID crashes
        // the server with an unhandled TypeError.
        if (!(victim instanceof Player) && !(victim instanceof Monster)) {
            this.logger.info(`[CharacterAttackService] Invalid attack victim with virtualId ${victimVirtualId}`);
            return;
        }

        player.attack(attackType, victim);
    }
}
