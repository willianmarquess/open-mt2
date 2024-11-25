import { Logger } from "winston";
import DatabaseManager from "../infra/database/DatabaseManager";
import CacheProvider from "../infra/cache/CacheProvider";

export default abstract class Application {
  constructor(
    protected readonly logger: Logger,
    protected readonly server: any,
    protected readonly databaseManager: DatabaseManager,
    protected readonly cacheProvider: CacheProvider,
  ) {}
}
