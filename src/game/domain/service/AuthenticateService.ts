import Logger from '@/core/infra/logger/Logger';
import CacheProvider from '@/core/infra/cache/CacheProvider';
import { ErrorTypesEnum } from '@/core/enum/ErrorTypesEnum';
import CacheKeyGenerator from '@/core/util/CacheKeyGenerator';
import Result from '@/core/domain/util/Result';

type Token = {
    username: string;
    accountId: number;
};

export default class AuthenticateService {
    private logger: Logger;
    private cacheProvider: CacheProvider;

    constructor({ logger, cacheProvider }) {
        this.logger = logger;
        this.cacheProvider = cacheProvider;
    }

    async execute(key: number, username: string): Promise<Result<Token, ErrorTypesEnum>> {
        const cacheKey = CacheKeyGenerator.createTokenKey(String(key));
        const tokenExists = await this.cacheProvider.exists(cacheKey);

        if (!tokenExists) {
            this.logger.info(`[AuthenticateService] Invalid token for username: ${username}`);
            return Result.error(ErrorTypesEnum.INVALID_TOKEN);
        }

        const token = JSON.parse(await this.cacheProvider.get<string>(cacheKey));

        if (username !== token.username) {
            this.logger.info(`[AuthenticateService] Invalid token for username: ${username}`);
            return Result.error(ErrorTypesEnum.INVALID_TOKEN);
        }

        return Result.ok(token as Token);
    }
}
