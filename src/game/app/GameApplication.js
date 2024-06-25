import Application from '../../core/app/Application.js';

export default class GameApplication extends Application {
    #world;
    #animationManager;
    #mobManager;

    constructor(container) {
        super(container);
        this.#world = container.world;
        this.#animationManager = container.animationManager;
        this.#mobManager = container.mobManager;
    }

    async start() {
        this.logger.info('[APP] Init game application');
        await this.databaseManager.init();
        await this.cacheProvider.init();
        await this.server.setup().start();
        await this.#animationManager.load();
        await this.#mobManager.load();
        await this.#world.init(this.server);
        this.logger.info('[APP] Game application started 🎮🚀');
    }

    async close() {
        this.logger.info('[APP] Closing game application... 🎮🛬');
        await this.server.close();
        await this.databaseManager.close();
        await this.cacheProvider.close();
    }
}
