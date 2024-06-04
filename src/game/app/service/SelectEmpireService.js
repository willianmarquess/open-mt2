import Result from '../../../core/app/Result.js';
import ErrorTypesEnum from '../../../core/enum/ErrorTypesEnum.js';
import CacheKeyGenerator from '../../../core/util/CacheKeyGenerator.js';

export default class SelectEmpireService {
    #logger;
    #cacheProvider;

    constructor({ logger, cacheProvider }) {
        this.#logger = logger;
        this.#cacheProvider = cacheProvider;
    }

    async execute({ empireId, accountId }) {
        const isValidEmpire = empireId > 0 && empireId < 4;

        if (!isValidEmpire) {
            this.#logger.info(`[SelectEmpireService] Invalid empire ${empireId}`);
            return Result.error(ErrorTypesEnum.INVALID_EMPIRE);
        }

        const key = CacheKeyGenerator.createEmpireKey(accountId);
        await this.#cacheProvider.set(key, empireId);
    }
}
