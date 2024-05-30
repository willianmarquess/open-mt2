import CharacterDetailsPacket from '../../../core/interface/networking/packets/packet/out/CharacterDetailsPacket.js';
import CharacterPointsPacket from '../../../core/interface/networking/packets/packet/out/CharacterPointsPacket.js';
import CharacterUpdatePacket from '../../../core/interface/networking/packets/packet/out/CharacterUpdatePacket.js';

export default class SpawnCharacterService {
    #playerFactory;
    #world;

    constructor({ playerFactory, world }) {
        this.#playerFactory = playerFactory;
        this.#world = world;
    }

    async execute(connection, playerData) {
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
