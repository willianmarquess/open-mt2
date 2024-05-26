import Player from '../../../../domain/entities/Player.js';
import ConnectionStateEnum from '../../../../enum/ConnectionStateEnum.js';
import CharacterDetailsPacket from '../packet/out/CharacterDetailsPacket.js';
import CharacterPointsPacket from '../packet/out/CharacterPointsPacket.js';
import CharacterUpdatePacket from '../packet/out/CharacterUpdatePacket.js';

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

        connection.send(
            new CharacterDetailsPacket({
                vid: player.id,
                playerClass: player.playerClass,
                playerName: player.name,
                skillGroup: player.skillGroup,
                posX: player.positionX,
                posY: player.positionY,
                posZ: 0,
                empireId: player.empire,
            }),
        );
        //just fake, we need to send real points
        connection.send(new CharacterPointsPacket());
        connection.send(
            new CharacterUpdatePacket({
                vid: player.id,
                attackSpeed: 200,
                moveSpeed: 200,
            }),
        );
    }
}
