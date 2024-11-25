import { Pool } from "mysql2/promise";
import MySqlConnection from "./connection/MySqlConnection.js";
import loadScript from "./scripts/loadScript.js";
import { Logger } from "winston";

export default class DatabaseManager {
  private connection: Pool | null = null;

  constructor(
    private readonly config: any,
    private readonly logger: Logger,
  ) {}

  getConnection(): Pool {
    if (this.connection) return this.connection;
    this.connection = MySqlConnection.getConnection(
      this.config.DB_HOST,
      this.config.DB_PORT,
      this.config.DB_DATABASE_NAME,
      this.config.DB_USER,
      this.config.DB_ROOT_PASSWORD,
    );
    return this.connection;
  }

  private async executeScripts() {
    if (!this.config.MIGRATE) return;
    const scripts = await loadScript();
    this.logger.info(`[DBMANAGER] Executing database scripts...`);
    for await (const script of scripts) {
      this.logger.debug(`[DBMANAGER] Executing command: ${script}`);
      await this.connection?.execute(script);
    }
  }

  async init() {
    this.logger.info("[DBMANAGER] Connecting with database");
    await this.executeScripts();
    this.logger.info("[DBMANAGER] Connected with success");
  }

  close() {
    return this.connection?.end();
  }
}
