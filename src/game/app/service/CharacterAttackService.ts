import Player from '@/core/domain/entities/game/player/Player';
import World from '@/core/domain/World';
import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
import Logger from '@/core/infra/logger/Logger';

export default class CharacterAttackService {
    private readonly logger: Logger;
    private readonly world: World;

    constructor({ logger, world }) {
        this.logger = logger;
        this.world = world;
    }

    async execute(player: Player, attackType: AttackTypeEnum, victimVirtualId: number) {
        const area = this.world.getAreaByCoordinates(player.getPositionX(), player.getPositionY());

        if (!area) {
            this.logger.info(
                `[CharacterAttackService] Area not found at x: ${player.getPositionX()}, y: ${player.getPositionY()}`,
            );
            return;
        }

        const victim = area.getEntity(victimVirtualId);

        if (!victim) {
            this.logger.info(`[CharacterAttackService] Victim not found with virtualId ${victimVirtualId}`);
            return;
        }

        player.attack(victim, attackType);
    }
}
