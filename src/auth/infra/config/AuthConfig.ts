import { makeConfig, Config } from "@/core/infra/config/Config";

export type AuthConfig = Config & {
    SERVER_PORT: string,
    SERVER_ADDRESS: string,
    DB_DATABASE_NAME: string
}

const authConfig: AuthConfig = {
    ...makeConfig(),
    SERVER_PORT: process.env.AUTH_SERVER_PORT,
    SERVER_ADDRESS: process.env.AUTH_SERVER_ADDRESS,
    DB_DATABASE_NAME: process.env.AUTH_DB_DATABASE_NAME,
}

export const makeAuthConfig = () => authConfig;