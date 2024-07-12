import ConnectionStateEnum from '../../../../../../enum/ConnectionStateEnum.js';
import CharacterDetailsPacket from '../../out/CharacterDetailsPacket.js';
import CharacterPointsPacket from '../../out/CharacterPointsPacket.js';

export default class SelectCharacterPacketHandler {
    #selectCharacterService;
    #logger;

    constructor({ selectCharacterService, logger }) {
        this.#selectCharacterService = selectCharacterService;
        this.#logger = logger;
    }

    async execute(connection, packet) {
        if (!packet.isValid()) {
            this.#logger.error(`[SelectCharacterPacketHandler] Packet invalid`);
            this.#logger.error(packet.errors());
            connection.close();
            return;
        }

        const { accountId } = connection;
        if (!accountId) {
            this.#logger.info(
                `[SelectCharacterPacketHandler] The connection does not have an accountId, this cannot happen`,
            );
            connection.close();
            return;
        }

        connection.state = ConnectionStateEnum.LOADING;

        const { slot } = packet;
        const result = await this.#selectCharacterService.execute({ slot, accountId });

        if (result.hasError()) {
            connection.close();
            return;
        }

        const { data: player } = result;

        connection.player = player;

        connection.send(
            new CharacterDetailsPacket({
                vid: player.virtualId,
                playerClass: player.playerClass,
                playerName: player.name,
                skillGroup: player.skillGroup,
                positionX: player.positionX,
                positionY: player.positionY,
                positionZ: 0,
                empireId: player.empire,
            }),
        );

        const characterPointsPacket = new CharacterPointsPacket();
        for (const point in player.getPoints()) {
            characterPointsPacket.addPoint(point, player.getPoint(point));
        }

        connection.send(characterPointsPacket);
    }
}
