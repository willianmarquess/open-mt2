import { randomBytes } from 'node:crypto';
import CacheKeyGenerator from '../../../core/util/CacheKeyGenerator';
import Logger from '@/core/infra/logger/Logger';
import { ErrorTypesEnum } from '@/core/enum/ErrorTypesEnum';
import CacheProvider from '@/core/infra/cache/CacheProvider';
import { EncryptionProvider } from '@/core/infra/encryption/EncryptionProvider';
import Result from '@/core/domain/util/Result';
import { IAccountRepository } from '@/core/domain/repository/IAccountRepository';

const TOKEN_EXPIRATION_SECS = 60 * 60 * 24;

export type LoginError =
    | { type: Exclude<ErrorTypesEnum, ErrorTypesEnum.LOGIN_NOT_ALLOWED> }
    | { type: ErrorTypesEnum.LOGIN_NOT_ALLOWED; clientStatus: string };

export default class LoginService {
    private readonly accountRepository: IAccountRepository;
    private readonly logger: Logger;
    private readonly cacheProvider: CacheProvider;
    private readonly encryptionProvider: EncryptionProvider;

    constructor({
        accountRepository,
        logger,
        cacheProvider,
        encryptionProvider,
    }: {
        accountRepository: IAccountRepository;
        logger: Logger;
        cacheProvider: CacheProvider;
        encryptionProvider: EncryptionProvider;
    }) {
        this.accountRepository = accountRepository;
        this.logger = logger;
        this.cacheProvider = cacheProvider;
        this.encryptionProvider = encryptionProvider;
    }

    async execute({ username, password }: { username: string; password: string }): Promise<Result<number, LoginError>> {
        const account = await this.accountRepository.findByUsername(username);

        if (!account) {
            this.logger.info(`[LoginService] Username not found for username ${username}`);
            return Result.error({ type: ErrorTypesEnum.INVALID_USERNAME });
        }

        const isPasswordValid = await this.encryptionProvider.compare(password, account.getPassword());

        if (!isPasswordValid) {
            this.logger.info(`[LoginService] Invalid password for username ${username}`);
            return Result.error({ type: ErrorTypesEnum.INVALID_PASSWORD });
        }

        const accountStatus = account.getAccountStatus();

        if (!accountStatus.getAllowLogin()) {
            this.logger.info(
                `[LoginService] Login not allowed for username ${username} (status: ${accountStatus.getClientStatus()})`,
            );
            return Result.error({
                type: ErrorTypesEnum.LOGIN_NOT_ALLOWED,
                clientStatus: accountStatus.getClientStatus(),
            });
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
