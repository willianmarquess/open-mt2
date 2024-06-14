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

    get container() {
        return this.#container;
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
        this.#server = createServer(this.#onListener.bind(this));
        return this;
    }

    createConnection() {
        throw new Error('this method must be overwritten');
    }

    #onListener(socket) {
        const connection = this.createConnection(socket);
        this.connections.set(connection.id, connection);

        this.logger.debug(`[IN][CONNECT SOCKET EVENT] New connection: ID: ${connection.id}`);
        connection.startHandShake();

        socket.on('close', this.onClose.bind(this, connection));
        socket.on('data', this.onData.bind(this, connection));
        socket.on('error', (err) => this.#logger.error(err));
    }

    async onClose(connection) {
        this.#logger.debug(`[IN][CLOSE SOCKET EVENT] Closing connection: ID: ${connection.id}`);
        this.#connections.delete(connection.id);
    }

    start() {
        return new Promise((resolve, reject) => {
            this.#server.listen(this.#config.SERVER_PORT, this.#config.SERVER_ADDRESS, (err) => {
                if (err) reject(err);
                this.#logger.info(`Server running on: ${this.#config.SERVER_ADDRESS}:${this.#config.SERVER_PORT} 🔥 `);
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
