import Application from '../../core/app/Application.js';

export default class GameApplication extends Application {
    #world;

    constructor(container) {
        super(container);
        this.#world = container.world;
    }

    async start() {
        this.logger.info('[APP] Init application');
        await this.databaseManager.init();
        await this.server.setup().start();
        await this.#world.init();
        this.logger.info('[APP] Application started 🚀');
    }
}
