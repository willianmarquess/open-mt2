import Application from '../../core/app/Application.js';

export default class AuthApplication extends Application {
    async start() {
        this.logger.info('[APP] Init auth application');
        await this.databaseManager.init();
        await this.cacheProvider.init();
        await this.server.setup().start();
        this.logger.info('[APP] Auth application started 🔒🚀');
    }

    async close() {
        this.logger.info('[APP] Closing auth application... 🔒🛬');
        await this.server.close();
        await this.databaseManager.close();
        await this.cacheProvider.close();
    }
}
