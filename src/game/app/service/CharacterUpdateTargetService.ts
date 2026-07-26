import Character from '@/core/domain/entities/game/Character';
import Player from '@/core/domain/entities/game/player/Player';
import { EntityManager } from '@/core/domain/manager/EntityManager';
import Logger from '@/core/infra/logger/Logger';

export default class CharacterUpdateTargetService {
    private readonly logger: Logger;
    private readonly entityManager: EntityManager;

    constructor({ logger, entityManager }: { logger: Logger; entityManager: EntityManager }) {
        this.logger = logger;
        this.entityManager = entityManager;
    }

    async execute(player: Player, targetVirtualId: number) {
        const target = this.entityManager.getEntity(targetVirtualId);

        // A client can send any VID in view, including dropped items (GameEntity
        // but not Character). getEntity's generic is only a cast, and setTarget
        // calls Character-only methods, so reject anything that isn't a Character
        // (this is the anti-hacking check that was previously left unimplemented).
        if (!(target instanceof Character)) {
            this.logger.info(`[CharacterUpdateTargetService] Invalid target with virtualId ${targetVirtualId}`);
            return;
        }

        player.setTarget(target);
    }
}
