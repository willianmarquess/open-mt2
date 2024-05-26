import ConnectionStateEnum from '../../../../enum/ConnectionStateEnum.js';
import Ip from '../../../../util/Ip.js';
import EmpirePacket from '../packet/bidirectional/EmpirePacket.js';
import CharactersInfoPacket from '../packet/out/CharactersInfoPacket.js';

export default class AuthTokenPacketHandler {
    #authenticateService;
    #loadCharactersService;
    #config;

    constructor({ authenticateService, loadCharactersService, config }) {
        this.#authenticateService = authenticateService;
        this.#loadCharactersService = loadCharactersService;
        this.#config = config;
    }

    async execute(connection, packet) {
        const authResult = await this.#authenticateService.execute({
            key: packet.key,
            username: packet.username,
        });

        if (authResult.hasError()) {
            connection.close();
            return;
        }

        const { data: token } = authResult;
        connection.accountId = token.accountId;

        const loadCharactersResult = await this.#loadCharactersService.execute({
            accountId: token.accountId,
        });

        if (loadCharactersResult.isOk()) {
            const {
                data: { empireId, players },
            } = loadCharactersResult;

            connection.send(
                new EmpirePacket({
                    empireId,
                }),
            );

            const characterInfoPacket = new CharactersInfoPacket();
            players.forEach((player, index) => {
                characterInfoPacket.addCharacter(index, {
                    name: player.name,
                    playerClass: player.playerClass,
                    bodyPart: player.bodyPart,
                    hairPart: player.hairPart,
                    level: player.level,
                    skillGroup: player.skillGroup,
                    playTime: player.playTime,
                    port: this.#config.SERVER_PORT,
                    ip: Ip.toInt(this.#config.SERVER_ADDRESS),
                    id: player.id,
                    nameChange: 0,
                    positionX: player.positionX,
                    positionY: player.positionY,
                    ht: player.ht, //vit
                    st: player.st, //str
                    dx: player.dx, //des
                    iq: player.iq, //int
                });
            });
            connection.send(characterInfoPacket);
        }

        connection.state = ConnectionStateEnum.SELECT;
    }
}
