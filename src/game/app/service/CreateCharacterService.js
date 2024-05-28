import Result from '../../../core/app/Result.js';
import Player from '../../../core/domain/entities/Player.js';
import EmpireUtil from '../../../core/domain/util/EmpireUtil.js';
import JobUtil from '../../../core/domain/util/JobUtil.js';
import ErrorTypesEnum from '../../../core/enum/ErrorTypesEnum.js';
import CacheKeyGenerator from '../../../core/util/CacheKeyGenerator.js';

const MAX_PLAYERS_PER_ACCOUNT = 4;

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
        const className = JobUtil.getClassNameFromClassId(playerClass);
        const empireName = EmpireUtil.getEmpireName(empireId);

        const player = Player.create({
            accountId,
            name: playerName,
            empire: empireId,
            playerClass,
            appearance, //verify this
            slot,
            positionX: this.#config.empire[empireName].startPosX,
            positionY: this.#config.empire[empireName].startPosY,
            st: this.#config.jobs[className].st,
            ht: this.#config.jobs[className].ht,
            dx: this.#config.jobs[className].dx,
            iq: this.#config.jobs[className].iq,
            health: this.#config.jobs[className].initialHp,
            mana: this.#config.jobs[className].initialMp,
            stamina: this.#config.jobs[className].initialStamina,
        });

        const playerId = await this.#playerRepository.create(player);
        player.id = playerId;
        return Result.ok(player);
    }
}
