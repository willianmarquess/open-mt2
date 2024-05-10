import { createServer } from 'node:net';
import ConnectionState from '../../../core/enum/ConnectionStateEnum.js';
import AuthConnection from '../networking/AuthConnection.js';

export default class AuthServer {
    #server;
    #connections = new Map();
    #logger;
    #config;
    #packets;
    #container;

    constructor(container) {
        this.#logger = container.logger;
        this.#config = container.config;
        this.#packets = container.packets;
        this.#container = container;
    }

    setup() {
        this.#server = createServer(this.#onListener.bind(this));
        return this;
    }

    #onListener(socket) {
        const connection = new AuthConnection({
            socket,
            logger: this.#logger,
            packets: this.#packets,
        });
        this.#connections.set(connection.id, connection);

        this.#logger.debug(`[IN][CONNECT SOCKET EVENT] New connection: ID: ${connection.id}`);
        connection.state = ConnectionState.HANDSHAKE;
        connection.startHandShake();

        socket.on('close', this.#onClose.bind(this, connection));
        socket.on('data', this.#onData.bind(this, connection));
    }

    #onClose(connection) {
        this.#logger.debug(`[IN][CLOSE SOCKET EVENT] Closing connection: ID: ${connection.id}`);
        this.#connections.delete(connection.id);
    }

    #onData(connection, data) {
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
}
