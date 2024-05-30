import ConnectionStateEnum from '../../../core/enum/ConnectionStateEnum.js';
import EmpirePacket from '../../../core/interface/networking/packets/packet/bidirectional/EmpirePacket.js';
import CharactersInfoPacket from '../../../core/interface/networking/packets/packet/out/CharactersInfoPacket.js';
import Ip from '../../../core/util/Ip.js';

export default class LoadCharactersService {
    #playerRepository;
    #authenticateService;
    #config;

    constructor({ playerRepository, authenticateService, config }) {
        this.#playerRepository = playerRepository;
        this.#authenticateService = authenticateService;
        this.#config = config;
    }

    async execute(connection, { key, username }) {
        const authResult = await this.#authenticateService.execute({
            key,
            username,
        });

        if (authResult.hasError()) {
            connection.close();
            return;
        }

        const { data: token } = authResult;
        connection.accountId = token.accountId;

        const players = await this.#playerRepository.getByAccountId(token.accountId);

        if (players?.length > 0) {
            connection.send(
                new EmpirePacket({
                    empireId: players[0].empire,
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
