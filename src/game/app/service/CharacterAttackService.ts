import Monster from '@/core/domain/entities/game/mob/Monster';
import Stone from '@/core/domain/entities/game/mob/Stone';
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

    /**
     * `skillVnum` is the Attack packet's original bType (TPacketCGAttack): 0 for a plain attack, or
     * the vnum of the ATTACK skill whose hit is landing now (CHARACTER::Attack, char_battle.cpp) -
     * the skill's cost/cooldown were already paid separately when it was cast (PlayerSkill.useSkill).
     */
    async execute(player: Player, skillVnum: number, victimVirtualId: number) {
        const victim = this.entityManager.getEntity(victimVirtualId);

        if (!(victim instanceof Player) && !(victim instanceof Monster) && !(victim instanceof Stone)) {
            this.logger.info(`[CharacterAttackService] Invalid attack victim with virtualId ${victimVirtualId}`);
            return;
        }

        if (skillVnum === 0) {
            player.attack(AttackTypeEnum.NORMAL, victim);
            return;
        }

        if (!player.useSkillAttack(skillVnum, victim)) {
            this.logger.info(
                `[CharacterAttackService] Rejected skill attack (vnum ${skillVnum}) from ${player.getName()} against ${victimVirtualId}`,
            );
        }
    }
}
