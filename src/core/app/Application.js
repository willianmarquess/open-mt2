export default class Application {
    #logger;
    #server;
    #databaseManager;

    constructor({ logger, server, databaseManager }) {
        this.#server = server;
        this.#logger = logger;
        this.#databaseManager = databaseManager;
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

    async start() {
        this.#logger.info('[APP] Init application');
        await this.#databaseManager.init();
        await this.#server.setup().start();
        this.#logger.info('[APP] Application started 🚀');
    }

    async close() {
        this.#logger.info('[APP] Closing application... 🛬');
        await this.#server.close();
        await this.#databaseManager.close();
    }
}
