import mysql, { Pool, PoolOptions } from "mysql2/promise";

export default class MySqlConnection {
  static getConnection(host: string, port: number, database: string, user: string, password: string): Pool {
    const poolOptions: PoolOptions = { host, port, database, user, password };
    return mysql.createPool(poolOptions);
  }
}
