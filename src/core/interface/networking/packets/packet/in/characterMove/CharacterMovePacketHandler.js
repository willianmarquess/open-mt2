export default class CharacterMovePacketHandler {
    #logger;
    #characterMoveService;

    constructor({ logger, characterMoveService }) {
        this.#logger = logger;
        this.#characterMoveService = characterMoveService;
    }

    async execute(connection, packet) {
        if (!packet.isValid()) {
            this.#logger.error(`[CharacterMovePacketHandler] Packet invalid`);
            this.#logger.error(packet.errors());
            connection.close();
            return;
        }

        const { player } = connection;

        if (!player) {
            this.#logger.info(
                `[CharacterMovePacketHandler] The connection does not have an player select, this cannot happen`,
            );
            connection.close();
            return;
        }

        const { movementType, positionX, positionY, arg, rotation, time } = packet;
        await this.#characterMoveService.execute({ player, movementType, positionX, positionY, arg, rotation, time });
    }
}
