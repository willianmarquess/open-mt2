import { createServer } from 'node:net';
import GameConnection from '../../../game/interface/networking/GameConnection.js';

export default class Server {
    #server;
    #connections = new Map();
    #logger;
    #config;
    #container;
    #packets;
    #isShuttingDown = false;

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

    get config() {
        return this.#config;
    }

    get isShuttingDown() {
        return this.#isShuttingDown;
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

    async close() {
        this.#isShuttingDown = true;

        for (const connection of this.#connections.values()) {
            if (connection instanceof GameConnection) {
                await connection.saveAndDestroy();
            }
        }

        if (!this.#server.listening || this.#isShuttingDown) return;

        return new Promise((resolve, reject) => {
            this.#server.close((err) => {
                if (err) {
                    this.#logger.error('[SERVER] Error when try to close server:', err);
                    reject(err);
                } else {
                    this.#logger.info('[SERVER] Server closed with success.');
                    resolve();
                }
            });
        });
    }
}
