import Player from '../../../../domain/entities/Player.js';
import ConnectionStateEnum from '../../../../enum/ConnectionStateEnum.js';

export default class SelectCharacterPacketHandler {
    #logger;
    #loadCharacterService;

    constructor({ logger, loadCharacterService }) {
        this.#logger = logger;
        this.#loadCharacterService = loadCharacterService;
    }

    async execute(connection, packet) {
        if (!connection.accountId) {
            this.#logger.info(
                `[SelectCharacterPacketHandler] The connection does not have an accountId, this cannot happen`,
            );
            connection.close();
            return;
        }

        connection.state = ConnectionStateEnum.LOADING;

        const result = await this.#loadCharacterService.execute({ accountId: connection.accountId, slot: packet.slot });

        if (result.hasError()) {
            connection.close();
            return;
        }

        const { data: playerData } = result;

        const player = Player.create(playerData);

        connection.player = player;
    }
}
