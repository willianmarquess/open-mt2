import { randomBytes } from 'crypto';
import CacheKeyGenerator from '../../../core/util/CacheKeyGenerator';
import Logger from '@/core/infra/logger/Logger';
import { ErrorTypesEnum } from '@/core/enum/ErrorTypesEnum';
import CacheProvider from '@/core/infra/cache/CacheProvider';
import { EncryptionProvider } from '@/core/infra/encryption/EncryptionProvider';
import { IAccountRepository } from '@/auth/infra/database/IAccountRepository';
import Result from '@/core/domain/util/Result';

const TOKEN_EXPIRATION_SECS = 60 * 60 * 24;

export default class LoginService {
    private readonly accountRepository: IAccountRepository;
    private readonly logger: Logger;
    private readonly cacheProvider: CacheProvider;
    private readonly encryptionProvider: EncryptionProvider;

    constructor({ accountRepository, logger, cacheProvider, encryptionProvider }) {
        this.accountRepository = accountRepository;
        this.logger = logger;
        this.cacheProvider = cacheProvider;
        this.encryptionProvider = encryptionProvider;
    }

    async execute({ username, password }): Promise<Result<number, ErrorTypesEnum>> {
        const account = await this.accountRepository.findByUsername(username);

        if (!account) {
            this.logger.info(`[LoginService] Username not found for username ${username}`);
            return Result.error(ErrorTypesEnum.INVALID_USERNAME);
        }

        const isPasswordValid = await this.encryptionProvider.compare(password, account.getPassword());

        if (!isPasswordValid) {
            this.logger.info(`[LoginService] Invalid password for username ${username}`);
            return Result.error(ErrorTypesEnum.INVALID_PASSWORD);
        }

        const key = randomBytes(4).readUInt32LE();

        await this.cacheProvider.set(
            CacheKeyGenerator.createTokenKey(String(key)),
            JSON.stringify({
                username: username,
                accountId: account.id,
            }),
            TOKEN_EXPIRATION_SECS,
        );

        return Result.ok(key);
    }
}
