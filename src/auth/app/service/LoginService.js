import { randomBytes } from 'crypto';
import CacheKeyGenerator from '../../../core/util/CacheKeyGenerator.js';
import LoginSuccessPacket from '../../../core/interface/networking/packets/packet/out/LoginSuccess.js';

const TOKEN_EXPIRATION_SECS = 60;
const LOGIN_SUCCESS_RESULT = 1;

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

    async execute(connection, { username, password }) {
        const account = await this.#accountRepository.findByUsername(username);

        if (!account) {
            this.#logger.info(`[LoginService] Username not found for username ${username}`);
            connection.close();
            return;
        }

        const isPasswordValid = await this.#encryptionProvider.compare(password, account.password);

        if (!isPasswordValid) {
            this.#logger.info(`[LoginService] Invalid password for username ${username}`);
            connection.close();
            return;
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

        connection.send(
            new LoginSuccessPacket({
                key,
                result: LOGIN_SUCCESS_RESULT,
            }),
        );
    }
}
