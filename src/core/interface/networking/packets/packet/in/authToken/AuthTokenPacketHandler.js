import ConnectionStateEnum from '../../../../../../enum/ConnectionStateEnum.js';
import Ip from '../../../../../../util/Ip.js';
import EmpirePacket from '../../bidirectional/empire/EmpirePacket.js';
import CharactersInfoPacket from '../../out/CharactersInfoPacket.js';

export default class AuthTokenPacketHandler {
    #loadCharactersService;
    #authenticateService;
    #config;
    #logger;

    constructor({ loadCharactersService, authenticateService, config, logger }) {
        this.#loadCharactersService = loadCharactersService;
        this.#authenticateService = authenticateService;
        this.#config = config;
        this.#logger = logger;
    }

    async execute(connection, packet) {
        if (!packet.isValid()) {
            this.#logger.error(`[AuthTokenPacketHandler] Packet invalid`);
            this.#logger.error(packet.errors());
            connection.close();
            return;
        }

        const { key, username } = packet;
        const authResult = await this.#authenticateService.execute({
            key,
            username,
        });

        if (authResult.hasError()) {
            connection.close();
            return;
        }

        const {
            data: { accountId },
        } = authResult;
        connection.accountId = accountId;

        const charactersResult = await this.#loadCharactersService.execute({ accountId });

        if (charactersResult.isOk()) {
            const { data: players } = charactersResult;

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
        }

        connection.state = ConnectionStateEnum.SELECT;
    }
}
