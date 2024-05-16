import { createClient } from 'redis';

export default class CacheProvider {
    #client;
    #logger;

    constructor({ logger, config }) {
        this.#client = createClient({
            socket: {
                host: config.CACHE_HOST,
                port: config.CACHE_PORT,
            },
            pingInterval: config.CACHE_PING_INTERVAL,
        });
        this.#logger = logger;
    }

    async init() {
        await this.#client.connect();
        this.#client.on('error', this.#onError.bind(this));
        this.#logger.info('[CACHE] Connected with success.');
    }

    #onError(error) {
        this.#logger.error('[CACHE] Connection error: ', error);
    }

    async set(key, value, expirationInSec) {
        await this.#client.set(key, value);
        if (expirationInSec) {
            await this.#client.expire(key, expirationInSec);
        }
    }

    async get(key) {
        return this.#client.get(key);
    }

    async delete(key) {
        return this.#client.del(key);
    }

    async close() {
        return this.#client.quit();
    }
}
