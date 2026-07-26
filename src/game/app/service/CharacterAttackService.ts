import Monster from '@/core/domain/entities/game/mob/Monster';
import Player from '@/core/domain/entities/game/player/Player';
import World from '@/core/domain/World';
import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
import Logger from '@/core/infra/logger/Logger';

export default class CharacterAttackService {
    private readonly logger: Logger;
    private readonly world: World;

    constructor({ logger, world }: { logger: Logger; world: World }) {
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

        // Only players and monsters can be attacked. A client can send any VID
        // it has in view (including dropped items, which are GameEntity but not
        // Character), so validate the type before the damage pipeline touches
        // methods like isDead() that only exist on attackable entities.
        if (!(victim instanceof Player) && !(victim instanceof Monster)) {
            this.logger.info(`[CharacterAttackService] Invalid attack victim with virtualId ${victimVirtualId}`);
            return;
        }

        player.attack(attackType, victim);
    }
}
