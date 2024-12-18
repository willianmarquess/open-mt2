import Logger from "@/core/infra/logger/Logger";
import Server from "@/core/interface/server/Server";

export default class Application {
    protected readonly logger: Logger;
    protected readonly server: Server;
    protected readonly databaseManager: any;
    protected readonly cacheProvider: any;

    constructor({ logger, server, databaseManager, cacheProvider }) {
        this.server = server;
        this.logger = logger;
        this.databaseManager = databaseManager;
        this.cacheProvider = cacheProvider;
    }
}
