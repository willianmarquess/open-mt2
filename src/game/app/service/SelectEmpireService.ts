import Result from '@/core/domain/util/Result';
import { ErrorTypesEnum } from '@/core/enum/ErrorTypesEnum';
import CacheProvider from '@/core/infra/cache/CacheProvider';
import Logger from '@/core/infra/logger/Logger';
import CacheKeyGenerator from '@/core/util/CacheKeyGenerator';

export default class SelectEmpireService {
    private readonly logger: Logger;
    private readonly cacheProvider: CacheProvider;

    constructor({ logger, cacheProvider }) {
        this.logger = logger;
        this.cacheProvider = cacheProvider;
    }

    async execute(empireId: number, accountId: number): Promise<Result<void, ErrorTypesEnum>> {
        const isValidEmpire = empireId > 0 && empireId < 4;

        if (!isValidEmpire) {
            this.logger.info(`[SelectEmpireService] Invalid empire ${empireId}`);
            return Result.error(ErrorTypesEnum.INVALID_EMPIRE);
        }

        const key = CacheKeyGenerator.createEmpireKey(accountId);
        await this.cacheProvider.set(key, empireId);
        return Result.ok();
    }
}
