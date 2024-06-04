import MovementTypeEnum from '../../../../enum/MovementTypeEnum.js';

export default class CharacterMovePacketHandler {
    #logger;

    constructor({ logger }) {
        this.#logger = logger;
    }

    async execute(connection, packet) {
        const { player } = connection;

        if (!player) {
            this.#logger.info(
                `[CharacterMovePacketHandler] The connection does not have an player select, this cannot happen`,
            );
            connection.close();
            return;
        }

        const { movementType, positionX, positionY, arg, rotation, time } = packet;

        switch (movementType) {
            case MovementTypeEnum.MOVE:
                player.goto(positionX, positionY, { arg, rotation, time, movementType, positionX, positionY });
                break;
            case MovementTypeEnum.WAIT:
                player.wait(positionX, positionY, { arg, rotation, time, movementType, positionX, positionY });
                break;
            default:
                this.#logger.info(`[CharacterMovePacketHandler] Movement type: ${movementType} not implemented`);
                break;
        }
    }
}
