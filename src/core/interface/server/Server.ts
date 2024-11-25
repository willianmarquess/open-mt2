import { createServer } from "node:net";
import { Container, Logger } from "winston";
import { Config } from "winston/lib/winston/config";
import Connection from "../networking/Connection";

export default abstract class Server {
  private server: any;
  private connections = new Map();
  private logger: Logger;
  private config: Config;
  protected container: Container;
  private packets: [];

  constructor(container: any) {
    this.logger = container.logger;
    this.config = container.config;
    this.container = container;
    this.packets = container.packets;
  }

  setup() {
    this.server = createServer(this.#onListener.bind(this));
    return this;
  }

  abstract createConnection(socket: any): Connection;

  #onListener(socket: any) {
    const connection = this.createConnection(socket);
    this.connections.set(connection.id, connection);
    this.logger.debug(`[IN][CONNECT SOCKET EVENT] New socket connection with id ${connection.id}`);
    connection.startHandShake();
    socket.on("close", this.onClose.bind(this, connection));
    socket.on("data", this.onData.bind(this, connection));
    socket.on("error", (err) => this.logger.error(err));
  }

  async onClose(connection) {
    this.logger.debug(`[IN][CLOSE SOCKET EVENT] Closing socket connection with id ${connection.id}`);
    this.connections.delete(connection.id);
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server.listen(this.config.SERVER_PORT, this.config.SERVER_ADDRESS, (err) => {
        if (err) reject(err);
        this.logger.info(`Server running on: ${this.config.SERVER_ADDRESS}:${this.config.SERVER_PORT} 🔥 `);
        resolve();
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }
}
