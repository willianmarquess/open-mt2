import Config from '../../../core/infra/config/Config.js';

export default () => ({
    ...Config(),
    SERVER_PORT: process.env.AUTH_SERVER_PORT,
    SERVER_ADDRESS: process.env.AUTH_SERVER_ADDRESS,
    DB_DATABASE_NAME: process.env.AUTH_DB_DATABASE_NAME,
});
