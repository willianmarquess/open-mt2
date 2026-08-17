import Monster from '@/core/domain/entities/game/mob/Monster';
import Stone from '@/core/domain/entities/game/mob/Stone';
import Player from '@/core/domain/entities/game/player/Player';
import { EntityManager } from '@/core/domain/manager/EntityManager';
import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
import Logger from '@/core/infra/logger/Logger';

export default class CharacterShootService {
    private readonly logger: Logger;
    private readonly entityManager: EntityManager;

    constructor({ logger, entityManager }: { logger: Logger; entityManager: EntityManager }) {
        this.logger = logger;
        this.entityManager = entityManager;
    }

    /**
     * Mirrors CHARACTER::Shoot (char_battle.cpp:2985): resolves every target staged by the preceding
     * FlyTargeting/AddFlyTargeting packets (player.consumeFlyTargets(), our m_dwFlyTargetID +
     * m_vec_dwFlyTargets equivalent) and lands the hit on each - `type` 0 is a plain bow shot, any
     * other value is the vnum of the ranged skill whose cast already paid its cost via SkillUsePacket.
     */
    async execute(player: Player, type: number) {
        const targetVirtualIds = player.consumeFlyTargets();

        for (const targetVirtualId of targetVirtualIds) {
            const target = this.entityManager.getEntity(targetVirtualId);

            if (!(target instanceof Player) && !(target instanceof Monster) && !(target instanceof Stone)) {
                this.logger.info(`[CharacterShootService] Invalid shoot target with virtualId ${targetVirtualId}`);
                continue;
            }

            if (type === 0) {
                player.attack(AttackTypeEnum.NORMAL, target);
                continue;
            }

            if (!player.useSkillAttack(type, target)) {
                this.logger.info(
                    `[CharacterShootService] Rejected shoot (type ${type}) from ${player.getName()} against ${targetVirtualId}`,
                );
            }
        }
    }
}
