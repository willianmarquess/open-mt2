import mysql from 'mysql2/promise';

export default class MySqlConnetion {
    static getConnection({ dbHost, dbUser, dbPass, dbName, dbPort }) {
        return mysql.createPool({
            host: dbHost,
            user: dbUser,
            password: dbPass,
            database: dbName,
            port: dbPort,
        });
    }
}
