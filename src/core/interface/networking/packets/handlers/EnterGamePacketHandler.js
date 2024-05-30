import ConnectionStateEnum from '../../../../enum/ConnectionStateEnum.js';
import ChannelPacket from '../packet/out/ChannelPacket.js';
import CharacterInfoPacket from '../packet/out/CharacterInfoPacket.js';
import CharacterSpawnPacket from '../packet/out/CharacterSpawnPacket.js';
import GameTimePacket from '../packet/out/GameTimePacket.js';

export default class EnterGamePacketHandler {
    #logger;

    constructor({ logger }) {
        this.#logger = logger;
    }

    async execute(connection, packet) {
        this.#logger.info(`[EnterGamePacketHandler] enter game received, id: ${connection.id}, packet: ${packet}`);

        if (!connection.player) {
            this.#logger.info(
                `[SelectCharacterPacketHandler] The connection does not have an player select, this cannot happen`,
            );
            connection.close();
            return;
        }

        connection.state = ConnectionStateEnum.GAME;

        connection.send(new GameTimePacket({ time: performance.now() }));
        connection.send(new ChannelPacket({ channel: 1 }));

        //set play time to calc when client disconnect

        const { player } = connection;

        connection.send(
            new CharacterSpawnPacket({
                vid: player.virtualId,
                playerClass: player.playerClass,
                entityType: player.entityType,
                attackSpeed: player.attackSpeed,
                moveSpeed: player.movementSpeed,
                positionX: player.positionX,
                positionY: player.positionY,
                positionZ: 0,
            }),
        );
        connection.send(
            new CharacterInfoPacket({
                vid: player.virtualId,
                empireId: player.empire,
                guildId: 0, //todo
                level: player.level,
                mountId: 0, //todo
                pkMode: 0, //todo
                playerName: player.name,
                rankPoints: 0, //todo
            }),
        );

        //world should spawn player
        //player should send inventory
    }
}
