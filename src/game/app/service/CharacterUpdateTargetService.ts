import Character from '@/core/domain/entities/game/Character';
import Player from '@/core/domain/entities/game/player/Player';
import World from '@/core/domain/World';
import Logger from '@/core/infra/logger/Logger';

export default class CharacterUpdateTargetService {
    private readonly logger: Logger;
    private readonly world: World;

    constructor({ logger, world }: { logger: Logger; world: World }) {
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

        const target = area.getEntity(targetVirtualId);

        // A client can send any VID in view, including dropped items (GameEntity
        // but not Character). setTarget calls Character-only methods, so reject
        // anything that isn't a Character.
        if (!(target instanceof Character)) {
            this.logger.info(`[CharacterUpdateTargetService] Invalid target with virtualId ${targetVirtualId}`);
            return;
        }

        player.setTarget(target);
    }
}
