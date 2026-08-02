import Player from '@/core/domain/entities/game/player/Player';
import { MovementTypeEnum } from '@/core/enum/MovementTypeEnum';
import Logger from '@/core/infra/logger/Logger';

type CharacterMoveServiceParams = {
    player: Player;
    movementType: MovementTypeEnum;
    positionX: number;
    positionY: number;
    arg: number;
    rotation: number;
    time: number;
};

export default class CharacterMoveService {
    private readonly logger: Logger;

    constructor({ logger }: { logger: Logger }) {
        this.logger = logger;
    }

    async execute({ player, movementType, positionX, positionY, arg, rotation, time }: CharacterMoveServiceParams) {
        // Reject teleport-hack packets (destination too far for one step); the
        // player is snapped back to their real position inside isMoveAllowed.
        if (!player.isMoveAllowed(positionX, positionY, movementType)) {
            this.logger.info(
                `[CharacterMoveService] Rejected move for ${player.getName()} to (${positionX}, ${positionY}) — too far from (${player.getPositionX()}, ${player.getPositionY()}), type=${movementType}`,
            );
            return;
        }

        switch (movementType) {
            case MovementTypeEnum.MOVE:
                player.goto({ positionX, positionY, arg, rotation, time, movementType });
                break;
            case MovementTypeEnum.WAIT:
                player.wait({ positionX, positionY, arg, rotation, time, movementType });
                break;
            case MovementTypeEnum.ATTACK:
            case MovementTypeEnum.COMBO:
                player.sync({ positionX, positionY, arg, rotation, time, movementType });
                break;
            default:
                this.logger.info(`[CharacterMoveService] Movement type: ${movementType} not implemented`);
                break;
        }
    }
}
