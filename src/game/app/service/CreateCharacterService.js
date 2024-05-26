import Result from '../../../core/app/Result.js';
import Player from '../../../core/domain/entities/Player.js';
import ErrorTypesEnum from '../../../core/enum/ErrorTypesEnum.js';
import CacheKeyGenerator from '../../../core/util/CacheKeyGenerator.js';

const MAX_PLAYERS_PER_ACCOUNT = 4;
// const clazzToJobMap = {
//     0: 0,
//     4: 0,
//     1: 1,
//     5: 1,
//     2: 2,
//     6: 2,
//     3: 3,
//     7: 3,
// };

const empireIdToEmpireNameMap = {
    1: 'red',
    2: 'yellow',
    3: 'blue',
};

//const getJob = (clazz) => clazzToJobMap[clazz] || clazzToJobMap[0];
const getEmpire = (empireId) => empireIdToEmpireNameMap[empireId];

/**
 * @typedef {Object} CreateCharacterInput
 * @property {number} accountId - The account ID of the player.
 * @property {string} playerName - The name of the player character.
 * @property {number} playerClass - The class of the player character.
 * @property {number} appearance - The appearance of the player character.
 * @property {number} slot - The slot in which the character is to be created.
 */

export default class CreateCharacterService {
    #logger;
    #cacheProvider;
    #playerRepository;
    #config;

    constructor({ logger, cacheProvider, playerRepository, config }) {
        this.#logger = logger;
        this.#cacheProvider = cacheProvider;
        this.#playerRepository = playerRepository;
        this.#config = config;
    }

    /**
     * Executes the character creation process.
     *
     * @param {CreateCharacterInput} [createCharacterInput=createCharacterInputDefault] - The input for creating a character.
     * @returns {Promise<Result>} A promise that resolves to a Result object indicating success or failure.
     */
    async execute(createCharacterInput) {
        const { playerName, accountId, playerClass, appearance, slot } = createCharacterInput;
        const nameAlreadyExists = await this.#playerRepository.nameAlreadyExists(playerName);

        if (nameAlreadyExists) {
            this.#logger.info(`[CreateCharacterService] The player name: ${playerName} already exists.`);
            return Result.error(ErrorTypesEnum.NAME_ALREADY_EXISTS);
        }

        const players = await this.#playerRepository.getByAccountId(accountId);

        if (players.length > MAX_PLAYERS_PER_ACCOUNT) {
            this.#logger.info(`[CreateCharacterService] The player account is full`);
            return Result.error(ErrorTypesEnum.ACCOUNT_FULL);
        }

        const key = CacheKeyGenerator.createEmpireKey(accountId);
        const empireIdExists = await this.#cacheProvider.exists(key);

        if (!empireIdExists) {
            this.#logger.info(`[CreateCharacterService] The empire was not selected before.`);
            return Result.error(ErrorTypesEnum.EMPIRE_NOT_SELECTED);
        }

        const empireId = await this.#cacheProvider.get(key);
        const positionX = this.#config.empire[getEmpire(empireId)].startPosX;
        const positionY = this.#config.empire[getEmpire(empireId)].startPosY;

        const player = Player.create({
            accountId,
            name: playerName,
            empire: empireId,
            playerClass,
            appearance, //verify this
            slot,
            positionX,
            positionY,
            st: 10,
            ht: 10,
            dx: 10,
            iq: 10,
            health: 1000,
            mana: 500,
            stamina: 500,
        });

        const playerId = await this.#playerRepository.create(player);
        player.id = playerId;
        return Result.ok(player);
    }
}
