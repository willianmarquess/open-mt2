import Application from '../../core/app/Application.js';

export default class GameApplication extends Application {
    #world;

    constructor(container) {
        super(container);
        this.#world = container.world;
    }

    async start() {
        this.logger.info('[APP] Init game application');
        await this.databaseManager.init();
        await this.cacheProvider.init();
        await this.server.setup().start();
        await this.#world.init();
        this.logger.info('[APP] Game application started 🎮🚀');
    }

    async close() {
        this.logger.info('[APP] Closing game application... 🎮🛬');
        await this.server.close();
        await this.databaseManager.close();
        await this.cacheProvider.close();
    }
}
