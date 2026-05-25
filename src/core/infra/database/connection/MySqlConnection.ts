import mysql from 'mysql2/promise';

export default class MySqlConnection {
    static getConnection({
        dbHost,
        dbUser,
        dbPass,
        dbName,
        dbPort,
    }: {
        dbHost: string;
        dbUser: string;
        dbPass: string;
        dbName?: string;
        dbPort: number;
    }): mysql.Pool {
        return mysql.createPool({
            host: dbHost,
            user: dbUser,
            password: dbPass,
            database: dbName,
            port: dbPort,
        });
    }
}
