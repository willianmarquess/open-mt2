import Character from '@/core/domain/entities/game/Character';
import Player from '@/core/domain/entities/game/player/Player';
import World from '@/core/domain/World';
import Logger from '@/core/infra/logger/Logger';

export default class CharacterUpdateTargetService {
    private readonly logger: Logger;
    private readonly world: World;

    constructor({ logger, world }) {
        this.logger = logger;
        this.world = world;
    }

    async execute(player: Player, targetVirtualId: number) {
        const area = this.world.getAreaByCoordinates(player.getPositionX(), player.getPositionY());

        if (!area) {
            this.logger.info(
                `[CharacterUpdateTargetService] Area not found at x: ${player.getPositionX()}, y: ${player.getPositionY()}`,
            );
            return;
        }

        const target = area.getEntity(targetVirtualId) as Character;

        if (!target) {
            this.logger.info(`[CharacterUpdateTargetService] Target not found with virtualId ${targetVirtualId}`);
            return;
        }

        player.setTarget(target);
    }
}
