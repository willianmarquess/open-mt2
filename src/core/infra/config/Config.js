export default () => ({
    SERVER_PORT: process.env.AUTH_SERVER_PORT,
    SERVER_ADDRESS: process.env.AUTH_SERVER_ADDRESS,

    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_ROOT_PASSWORD: process.env.DB_ROOT_PASSWORD,
    DB_DATABASE_NAME: process.env.DB_DATABASE_NAME,
    DB_USER: process.env.DB_USER,
});
