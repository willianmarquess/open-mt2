import MovementTypeEnum from '../../../core/enum/MovementTypeEnum.js';

export default class CharacterMoveService {
    private logger: any;

    constructor(logger: any) {
        this.logger = logger;
    }

    async execute(player: any, movementType: any, positionX: any, positionY: any, arg: any, rotation: any, time: any) {
        switch (movementType) {
            case MovementTypeEnum.MOVE:
                player.addExperience(500);
                player.goto({ positionX, positionY, arg, rotation, time, movementType });
                break;
            case MovementTypeEnum.WAIT:
                player.wait({ positionX, positionY, arg, rotation, time, movementType });
                break;
            default:
                this.logger.info(`[CharacterMoveService] Movement type: ${movementType} not implemented`);
                break;
        }
    }
}
