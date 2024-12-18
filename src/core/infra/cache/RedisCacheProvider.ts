import { createClient, RedisClientType } from 'redis';
import Logger from '@/core/infra/logger/Logger';
import CacheProvider from '@/core/infra/cache/CacheProvider';

export default class RedisCacheProvider implements CacheProvider {
    private readonly client: RedisClientType;
    private readonly logger: Logger;

    constructor({ logger, config }) {
        this.client = createClient({
            socket: {
                host: config.CACHE_HOST,
                port: config.CACHE_PORT,
            },
            pingInterval: config.CACHE_PING_INTERVAL,
        });
        this.logger = logger;
    }

    async init() {
        await this.client.connect();
        this.client.on('error', this.onError.bind(this));
        this.logger.info('[CACHE] Connected with success.');
    }

    onError(error: Error) {
        this.logger.error('[CACHE] Connection error: ', error);
    }

    async set(key: string, value: any, expirationInSec: number) {
        await this.client.set(key, value);
        if (expirationInSec) {
            await this.client.expire(key, expirationInSec);
        }
    }

    async get<T>(key: string) {
        return this.client.get(key) as T;
    }

    async delete(key: string) {
        await this.client.del(key);
    }

    async close() {
        await this.client.quit();
    }

    async exists(key: string) {
        const exists = await this.client.exists(key);
        return !!exists;
    }

    async keys(pattern: string) {
        return this.client.keys(pattern);
    }
}
