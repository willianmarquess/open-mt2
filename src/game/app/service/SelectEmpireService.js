import CacheKeyGenerator from '../../../core/util/CacheKeyGenerator.js';

export default class SelectEmpireService {
    #logger;
    #cacheProvider;

    constructor({ logger, cacheProvider }) {
        this.#logger = logger;
        this.#cacheProvider = cacheProvider;
    }

    async execute(connection, { empireId }) {
        const { accountId } = connection;
        if (!accountId) {
            this.#logger.info(`[SelectEmpireService] The connection does not have an accountId, this cannot happen`);
            connection.close();
            return;
        }

        const isValidEmpire = empireId > 0 && empireId < 4;

        if (!isValidEmpire) {
            this.#logger.info(`[SelectEmpireService] Invalid empire ${empireId}`);
            connection.close();
            return;
        }

        const key = CacheKeyGenerator.createEmpireKey(accountId);
        await this.#cacheProvider.set(key, empireId);
    }
}
