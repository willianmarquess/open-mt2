import CacheKeyGenerator from '../../../../util/CacheKeyGenerator.js';

export default class EmpirePacketHandler {
    #logger;
    #cacheProvider;

    constructor({ logger, cacheProvider }) {
        this.#logger = logger;
        this.#cacheProvider = cacheProvider;
    }

    async execute(connection, packet) {
        const { empireId } = packet;
        const isValidEmpire = empireId > 0 && empireId < 4;

        if (!isValidEmpire) {
            this.#logger.info(`[EMPIRE] Invalid empire ${empireId}`);
            connection.close();
            return;
        }

        if (!connection.accountId) {
            this.#logger.info(`[EMPIRE] The connection does not have an accountId, this cannot happen`);
            connection.close();
            return;
        }

        const key = CacheKeyGenerator.createEmpireKey(connection.accountId);
        await this.#cacheProvider.set(key, empireId);
    }
}
