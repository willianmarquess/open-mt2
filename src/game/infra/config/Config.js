import Config from '../../../core/infra/config/Config.js';

export default () => ({
    ...Config(),
    SERVER_PORT: process.env.GAME_SERVER_PORT,
    SERVER_ADDRESS: process.env.GAME_SERVER_ADDRESS,
    DB_DATABASE_NAME: process.env.GAME_DB_DATABASE_NAME,
});
