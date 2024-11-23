import { randomBytes } from 'crypto';
import CacheKeyGenerator from '../../../core/util/CacheKeyGenerator.js';
import Result from '../../../core/app/Result.js';
import ErrorTypesEnum from '../../../core/enum/ErrorTypesEnum.js';

const TOKEN_EXPIRATION_SECS = 60 * 60 * 24;

export default class LoginService {
    #accountRepository;
    #logger;
    #cacheProvider;
    #encryptionProvider;

    constructor({ accountRepository, logger, cacheProvider, encryptionProvider }) {
        this.#accountRepository = accountRepository;
        this.#logger = logger;
        this.#cacheProvider = cacheProvider;
        this.#encryptionProvider = encryptionProvider;
    }

    async execute({ username, password }) {
        const account = await this.#accountRepository.findByUsername(username);

        if (!account) {
            this.#logger.info(`[LoginService] Username not found for username ${username}`);
            return Result.error(ErrorTypesEnum.INVALID_USERNAME);
        }

        const isPasswordValid = await this.#encryptionProvider.compare(password, account.password);

        if (!isPasswordValid) {
            this.#logger.info(`[LoginService] Invalid password for username ${username}`);
            return Result.error(ErrorTypesEnum.INVALID_PASSWORD);
        }

        const key = randomBytes(4).readUInt32LE();

        await this.#cacheProvider.set(
            CacheKeyGenerator.createTokenKey(key),
            JSON.stringify({
                username: username,
                accountId: account.id,
            }),
            TOKEN_EXPIRATION_SECS,
        );

        return Result.ok(key);
    }
}
