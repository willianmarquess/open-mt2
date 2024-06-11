import MovementTypeEnum from '../../../core/enum/MovementTypeEnum.js';

export default class CharacterMoveService {
    #logger;

    constructor({ logger }) {
        this.#logger = logger;
    }

    async execute({ player, movementType, positionX, positionY, arg, rotation, time }) {
        switch (movementType) {
            case MovementTypeEnum.MOVE:
                player.addExperience(500);
                player.goto({ positionX, positionY, arg, rotation, time, movementType });
                break;
            case MovementTypeEnum.WAIT:
                player.wait({ positionX, positionY, arg, rotation, time, movementType });
                break;
            default:
                this.#logger.info(`[CharacterMoveService] Movement type: ${movementType} not implemented`);
                break;
        }
    }
}
