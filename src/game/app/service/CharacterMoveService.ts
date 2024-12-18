import Player from '@/core/domain/entities/game/player/Player';
import { MovementTypeEnum } from '@/core/enum/MovementTypeEnum';
import Logger from '@/core/infra/logger/Logger';

type CharacterMoveServiceParams = {
    player: Player, 
    movementType: MovementTypeEnum, 
    positionX: number, 
    positionY: number, 
    arg: number, 
    rotation: number, 
    time: number
}

export default class CharacterMoveService {
    private readonly logger: Logger;

    constructor({ logger }) {
        this.logger = logger;
    }

    async execute({ player, movementType, positionX, positionY, arg, rotation, time }: CharacterMoveServiceParams) {
        switch (movementType) {
            case MovementTypeEnum.MOVE:
                player.addExperience(500);
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
