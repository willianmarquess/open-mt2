import ConnectionStateEnum from '../../../../enum/ConnectionStateEnum.js';
import CharacterDetailsPacket from '../packet/out/CharacterDetailsPacket.js';
import CharacterPointsPacket from '../packet/out/CharacterPointsPacket.js';
import CharacterUpdatePacket from '../packet/out/CharacterUpdatePacket.js';

export default class SelectCharacterPacketHandler {
    #logger;
    #loadCharacterService;
    #world;
    #playerFactory;

    constructor({ logger, loadCharacterService, world, playerFactory }) {
        this.#logger = logger;
        this.#loadCharacterService = loadCharacterService;
        this.#world = world;
        this.#playerFactory = playerFactory;
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
        const player = this.#playerFactory.create({ ...playerData, virtualId: this.#world.generateVirtualId() });
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

        const characterPointsPacket = new CharacterPointsPacket();
        for (const point in player.getPoints()) {
            characterPointsPacket.addPoint(point, player.getPoint(point));
        }

        connection.send(characterPointsPacket);
        connection.send(
            new CharacterUpdatePacket({
                vid: player.virtualId,
                attackSpeed: player.attackSpeed,
                moveSpeed: player.movementSpeed,
            }),
        );
    }
}
