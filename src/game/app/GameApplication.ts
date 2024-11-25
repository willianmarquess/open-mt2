import Application from '../../core/app/Application.js';

export default class GameApplication extends Application {
    private world;
    private animationManager;
    private mobManager;
    private itemManager;

    constructor(container: any) {
        super(container);
        this.world = container.world;
        this.animationManager = container.animationManager;
        this.mobManager = container.mobManager;
        this.itemManager = container.itemManager;
    }

    async start() {
        this.logger.info('[APP] Init game application');
        await this.databaseManager.init();
        await this.cacheProvider.init();
        await this.mobManager.load();
        await this.animationManager.load();
        await this.itemManager.load();
        await this.server.setup().start();
        await this.world.init(this.server);
        this.logger.info('[APP] Game application started 🎮🚀');
    }

    async close() {
        this.logger.info('[APP] Closing game application... 🎮🛬');
        await this.server.close();
        await this.databaseManager.close();
        await this.cacheProvider.close();
    }
}
