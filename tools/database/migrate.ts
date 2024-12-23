import DatabaseManager from "@/core/infra/database/DatabaseManager";

const databaseManager = new DatabaseManager({
    logger: console,
    config: {
        DB_HOST: process.env.DB_HOST,
        DB_DATABASE_NAME: process.env.DB_DATABASE_NAME,
        DB_ROOT_PASSWORD: process.env.DB_ROOT_PASSWORD,
        DB_USER: process.env.DB_USER,
        DB_PORT: process.env.DB_PORT,
        MIGRATE: true
    }
});

databaseManager.init()
    .then(async () => {
        console.log('Database scripts ran successfully');
        await databaseManager.executeScripts();
        await databaseManager.close();
    })
    .catch(err => {
    console.error('Error when try to execute database scripts', err);
    })
    .finally(() => process.exit());