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
        console.log(`[CharacterUpdateTargetService]: targetVirtualId -> ${targetVirtualId}`);

        const target = this.entityManager.getEntity<Character>(targetVirtualId);

        //TODO: validate id the target item is in the same map (avoid hacking)

        if (!target) {
            this.logger.info(`[CharacterUpdateTargetService] Target not found with virtualId ${targetVirtualId}`);
            return;
        }

        player.setTarget(target);
    }
}
