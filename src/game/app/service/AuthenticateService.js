import Result from '../../../core/app/Result.js';
import ErrorTypesEnum from '../../../core/enum/ErrorTypesEnum.js';
import CacheKeyGenerator from '../../../core/util/CacheKeyGenerator.js';

/**
 * @typedef {Object} AuthenticateInput
 * @property {string} key - The authentication key.
 * @property {string} username - The username to be authenticated.
 */

export default class AuthenticateService {
    #logger;
    #cacheProvider;

    constructor({ logger, cacheProvider }) {
        this.#logger = logger;
        this.#cacheProvider = cacheProvider;
    }

    /**
     * Executes the authentication process.
     *
     * @param {AuthenticateInput} authenticateInput - The input required for authentication.
     * @returns {Promise<Result>} A promise that resolves to a Result object indicating success or failure.
     */
    async execute(authenticateInput) {
        const { key, username } = authenticateInput;
        const cacheKey = CacheKeyGenerator.createTokenKey(key);
        const tokenExists = await this.#cacheProvider.exists(cacheKey);

        if (!tokenExists) {
            this.#logger.info(`[AuthenticateService] Invalid token for username: ${username}`);
            return Result.error(ErrorTypesEnum.INVALID_TOKEN);
        }

        const token = JSON.parse(await this.#cacheProvider.get(cacheKey));

        if (username !== token.username) {
            this.#logger.info(`[AuthenticateService] Invalid token for username: ${username}`);
            return Result.error(ErrorTypesEnum.INVALID_TOKEN);
        }

        return Result.ok(token);
    }
}
