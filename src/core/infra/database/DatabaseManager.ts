import { Pool } from 'mysql2/promise';
import MySqlConnection from './connection/MySqlConnection';
import loadScript from './scripts/loadScript';
import Logger from '@/core/infra/logger/Logger';
import { Config } from '@/core/infra/config/Config';

export default class DatabaseManager {
    private connection: Pool;
    private logger: Logger;
    private config: Config;

    constructor({ config, logger }) {
        this.logger = logger;
        this.config = config;
    }

    getConnection() {
        if (this.connection) {
            return this.connection;
        }
        this.connection = MySqlConnection.getConnection({
            dbHost: this.config.DB_HOST,
            dbName: this.config.DB_DATABASE_NAME,
            dbPass: this.config.DB_ROOT_PASSWORD,
            dbUser: this.config.DB_USER,
            dbPort: this.config.DB_PORT,
        });

        return this.connection;
    }

    async executeScripts() {
        const scripts = await loadScript();
        this.logger.info(`[DBMANAGER] Executing database scripts...`);

        const connection = this.getConnection();

        for await (const script of scripts) {
            this.logger.debug(`[DBMANAGER] Executing command: ${script}`);
            await connection.execute(script);
        }
    }

    async init() {
        this.logger.info('[DBMANAGER] Connecting with database');
        await this.executeScripts();
        this.logger.info('[DBMANAGER] Connected with success');
    }

    close() {
        return this.connection?.end();
    }
}
