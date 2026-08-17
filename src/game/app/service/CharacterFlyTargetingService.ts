import Monster from '@/core/domain/entities/game/mob/Monster';
import Player from '@/core/domain/entities/game/player/Player';
import { EntityManager } from '@/core/domain/manager/EntityManager';
import Logger from '@/core/infra/logger/Logger';

export default class CharacterFlyTargetingService {
    private readonly logger: Logger;
    private readonly entityManager: EntityManager;

    constructor({ logger, entityManager }: { logger: Logger; entityManager: EntityManager }) {
        this.logger = logger;
        this.entityManager = entityManager;
    }

    /**
     * `isAdd` distinguishes HEADER_CG_FLY_TARGETING (replace the pending target) from
     * HEADER_CG_ADD_FLY_TARGETING (append another one) - see CHARACTER::FlyTarget, char_battle.cpp:3008.
     */
    async execute(player: Player, targetVirtualId: number, positionX: number, positionY: number, isAdd: boolean) {
        const entity = targetVirtualId !== 0 ? this.entityManager.getEntity(targetVirtualId) : undefined;

        // A client can send any VID it has in view (including dropped items, which are GameEntity but
        // not Player/Monster) - fall back to the raw position, matching the original's behavior when
        // CHARACTER_MANAGER::Find(dwTargetVID) comes back NULL.
        const target = entity instanceof Player || entity instanceof Monster ? entity : undefined;

        if (targetVirtualId !== 0 && !target) {
            this.logger.info(
                `[CharacterFlyTargetingService] Unresolvable fly target with virtualId ${targetVirtualId}`,
            );
        }

        player.flyTargeting(target, positionX, positionY, isAdd);
    }
}
