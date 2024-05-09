export default class Application {
    #container;

    constructor(container) {
        this.#container = container;
    }

    async start() {
        const { logger, server, databaseManager } = this.#container.cradle;

        logger.info('[APP] Init application');
        await databaseManager.init();
        await server.setup().start();
        logger.info('[APP] Application started 🚀');
    }
}
