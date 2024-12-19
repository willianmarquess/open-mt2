import Logger from '@/core/infra/logger/Logger';
import Server from '@/core/interface/server/Server';
import DatabaseManager from '../infra/database/DatabaseManager';
import CacheProvider from '../infra/cache/CacheProvider';

export default class Application {
    protected readonly logger: Logger;
    protected readonly server: Server;
    protected readonly databaseManager: DatabaseManager;
    protected readonly cacheProvider: CacheProvider;

    constructor({ logger, server, databaseManager, cacheProvider }) {
        this.server = server;
        this.logger = logger;
        this.databaseManager = databaseManager;
        this.cacheProvider = cacheProvider;
    }
}
