import Player from '../../../../domain/entities/Player.js';
import ConnectionStateEnum from '../../../../enum/ConnectionStateEnum.js';
import CharacterDetailsPacket from '../packet/out/CharacterDetailsPacket.js';
import CharacterPointsPacket from '../packet/out/CharacterPointsPacket.js';
import CharacterUpdatePacket from '../packet/out/CharacterUpdatePacket.js';

export default class SelectCharacterPacketHandler {
    #logger;
    #loadCharacterService;
    #world;

    constructor({ logger, loadCharacterService, world }) {
        this.#logger = logger;
        this.#loadCharacterService = loadCharacterService;
        this.#world = world;
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

        const player = Player.create({ ...playerData, virtualId: this.#world.generateVirtualId() });

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
        //just fake, we need to send real points
        connection.send(new CharacterPointsPacket());
        connection.send(
            new CharacterUpdatePacket({
                vid: player.virtualId,
                attackSpeed: 200,
                moveSpeed: 200,
            }),
        );
    }
}
