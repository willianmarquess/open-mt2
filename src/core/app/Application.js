export default class Application {
    #logger;
    #server;
    #databaseManager;
    #cacheProvider;

    constructor({ logger, server, databaseManager, cacheProvider }) {
        this.#server = server;
        this.#logger = logger;
        this.#databaseManager = databaseManager;
        this.#cacheProvider = cacheProvider;
    }

    get databaseManager() {
        return this.#databaseManager;
    }

    get logger() {
        return this.#logger;
    }

    get server() {
        return this.#server;
    }

    get cacheProvider() {
        return this.#cacheProvider;
    }
}
