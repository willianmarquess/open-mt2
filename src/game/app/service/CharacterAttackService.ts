import Monster from '@/core/domain/entities/game/mob/Monster';
import Player from '@/core/domain/entities/game/player/Player';
import BattleServiceFactory from '@/core/domain/service/battle/BattleServiceFactory';
import World from '@/core/domain/World';
import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
import Logger from '@/core/infra/logger/Logger';

export default class CharacterAttackService {
    private readonly logger: Logger;
    private readonly world: World;
    private readonly battleServiceFactory: BattleServiceFactory;

    constructor({ logger, world, battleServiceFactory }) {
        this.logger = logger;
        this.world = world;
        this.battleServiceFactory = battleServiceFactory;
    }

    async execute(player: Player, attackType: AttackTypeEnum, victimVirtualId: number) {
        const area = this.world.getAreaByCoordinates(player.getPositionX(), player.getPositionY());

        if (!area) {
            this.logger.info(
                `[CharacterAttackService] Area not found at x: ${player.getPositionX()}, y: ${player.getPositionY()}`,
            );
            return;
        }

        const victim = area.getEntity(victimVirtualId) as Player | Monster;

        if (!victim) {
            this.logger.info(`[CharacterAttackService] Victim not found with virtualId ${victimVirtualId}`);
            return;
        }

        const battleService = this.battleServiceFactory.createBattleService(player, victim);
        battleService.execute(attackType);
    }
}
