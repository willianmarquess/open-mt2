import { createServer } from 'node:net';

export default class Server {
    #server;
    #connections = new Map();
    #logger;
    #config;
    #container;
    #packets;

    constructor(container) {
        this.#logger = container.logger;
        this.#config = container.config;
        this.#container = container;
        this.#packets = container.packets;
    }

    get packets() {
        return this.#packets;
    }

    get logger() {
        return this.#logger;
    }

    get connections() {
        return this.#connections;
    }

    setup() {
        this.#server = createServer(this.onListener.bind(this));
        return this;
    }

    onListener() {
        throw new Error('this method must be overwritten');
    }

    onClose(connection) {
        this.#logger.debug(`[IN][CLOSE SOCKET EVENT] Closing connection: ID: ${connection.id}`);
        this.#connections.delete(connection.id);
    }

    onData(connection, data) {
        this.#container.containerInstance.createScope();
        this.#logger.debug(`[IN][DATA SOCKET EVENT] Data received from ID: ${connection.id}`);
        connection.onData(data, this.#container);
    }

    start() {
        return new Promise((resolve, reject) => {
            this.#server.listen(this.#config.SERVER_PORT, this.#config.SERVER_ADDRESS, (err) => {
                if (err) reject(err);
                this.#logger.info(
                    `Auth server running on: ${this.#config.SERVER_ADDRESS}:${this.#config.SERVER_PORT} 🔥 `,
                );
                resolve();
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.#server.close((err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }
}
