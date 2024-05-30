import CreateCharacterFailureReasonEnum from '../../../core/enum/CreateCharacterFailureReasonEnum.js';
import CreateCharacterFailurePacket from '../../../core/interface/networking/packets/packet/out/CreateCharacterFailurePacket.js';
import CreateCharacterSuccessPacket from '../../../core/interface/networking/packets/packet/out/CreateCharacterSuccessPacket.js';
import CacheKeyGenerator from '../../../core/util/CacheKeyGenerator.js';
import Ip from '../../../core/util/Ip.js';

const MAX_PLAYERS_PER_ACCOUNT = 4;

/**
 * @typedef {Object} CreateCharacterInput
 * @property {string} playerName - The name of the player character.
 * @property {number} playerClass - The class of the player character.
 * @property {number} appearance - The appearance of the player character.
 * @property {number} slot - The slot in which the character is to be created.
 */

export default class CreateCharacterService {
    #logger;
    #cacheProvider;
    #playerRepository;
    #playerFactory;
    #config;

    constructor({ logger, cacheProvider, playerRepository, playerFactory, config }) {
        this.#logger = logger;
        this.#cacheProvider = cacheProvider;
        this.#playerRepository = playerRepository;
        this.#playerFactory = playerFactory;
        this.#config = config;
    }

    /**
     * Executes the character creation process.
     * @param {connection} [connection] - represents the connection interface between client and server
     * @param {CreateCharacterInput} [createCharacterInput=createCharacterInputDefault] - The input for creating a character.
     * @returns {Promise<void>} A promise that resolves to a void.
     */
    async execute(connection, createCharacterInput) {
        const { accountId } = connection;
        if (!accountId) {
            this.#logger.info(
                `[CreateCharacterPacketHandler] The connection does not have an accountId, this cannot happen`,
            );
            connection.close();
            return;
        }

        const { playerName, playerClass, appearance, slot } = createCharacterInput;
        const nameAlreadyExists = await this.#playerRepository.nameAlreadyExists(playerName);

        if (nameAlreadyExists) {
            this.#logger.info(`[CreateCharacterService] The player name: ${playerName} already exists.`);
            connection.send(
                new CreateCharacterFailurePacket({
                    reason: CreateCharacterFailureReasonEnum.NAME_ALREADY_EXISTS,
                }),
            );
            return;
        }

        const players = await this.#playerRepository.getByAccountId(accountId);

        if (players.length > MAX_PLAYERS_PER_ACCOUNT) {
            this.#logger.info(`[CreateCharacterService] The player account is full`);
            connection.close();
            return;
        }

        const key = CacheKeyGenerator.createEmpireKey(accountId);
        const empireIdExists = await this.#cacheProvider.exists(key);

        if (!empireIdExists) {
            this.#logger.info(`[CreateCharacterService] The empire was not selected before.`);
            connection.close();
            return;
        }

        const empireId = await this.#cacheProvider.get(key);

        const player = this.#playerFactory.create({
            playerClass,
            empire: empireId,
            name: playerName,
            accountId,
            appearance,
            slot,
        });

        const playerId = await this.#playerRepository.create(player);

        connection.send(
            new CreateCharacterSuccessPacket({
                slot,
                character: {
                    name: player.name,
                    playerClass: player.playerClass,
                    bodyPart: player.bodyPart,
                    hairPart: player.hairPart,
                    level: player.level,
                    skillGroup: player.skillGroup,
                    playTime: player.playTime,
                    port: this.#config.SERVER_PORT,
                    ip: Ip.toInt(this.#config.SERVER_ADDRESS),
                    id: playerId,
                    nameChange: 0,
                    positionX: player.positionX,
                    positionY: player.positionY,
                    ht: player.ht,
                    st: player.st,
                    dx: player.dx,
                    iq: player.iq,
                },
            }),
        );
    }
}
