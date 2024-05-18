import ConnectionStateEnum from '../../../../enum/ConnectionStateEnum.js';
import CacheKeyGenerator from '../../../../util/CacheKeyGenerator.js';

export default class AuthTokenPacketHandler {
    #logger;
    #cacheProvider;

    constructor({ logger, cacheProvider }) {
        this.#logger = logger;
        this.#cacheProvider = cacheProvider;
    }

    async execute(connection, packet) {
        const key = CacheKeyGenerator.createTokenKey(packet.key);
        const tokenExists = await this.#cacheProvider.exists(key);

        if (!tokenExists) {
            this.#logger.info(`[AUTHTOKEN] Invalid token for username: ${packet.username}`);
            connection.close();
            return;
        }

        const token = JSON.parse(await this.#cacheProvider.get(key));

        if (packet.username !== token.username) {
            this.#logger.info(`[AUTHTOKEN] Invalid token for username: ${packet.username}`);
            connection.close();
            return;
        }

        //TODO: we need to validate if already exists chars for this username
        //We nedd to receive 0x5A packet (empirepacket)
        connection.accountId = token.accountId;
        connection.state = ConnectionStateEnum.SELECT;
    }
}
