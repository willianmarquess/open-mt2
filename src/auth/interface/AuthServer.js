import { createServer } from 'node:net';
import { Connection } from '../../core/networking/Connection.js';
import ConnectionState from '../../core/enum/ConnectionState.js';

export default class AuthServer {
    #server;
    #connections = new Map();
    #logger;
    #config;
    #packets;

    constructor({ logger, config, packets }) {
        this.#logger = logger;
        this.#config = config;
        this.#packets = packets;
    }

    setup() {
        this.#server = createServer(this.#onListener.bind(this));
        return this;
    }

    #onListener(socket) {
        const connection = new Connection({
            socket,
            logger: this.#logger,
            packets: this.#packets,
        });
        this.#connections.set(connection.id, connection);

        this.#logger.info(`[IN][CONNECT SOCKET EVENT] New connection: ID: ${connection.id}`);
        connection.state = ConnectionState.HANDSHAKE;
        connection.startHandShake();

        socket.on('close', this.#onClose.bind(this, connection));
        socket.on('data', this.#onData.bind(this, connection));
    }

    #onClose(connection) {
        this.#logger.info(`[IN][CLOSE SOCKET EVENT] Closing connection: ID: ${connection.id}`);
        this.#connections.delete(connection.id);
    }

    #onData(connection, data) {
        this.#logger.info(`[IN][DATA SOCKET EVENT] Data received from ID: ${connection.id}`);
        connection.onData(data);
    }

    start() {
        this.#server.listen(this.#config.SERVER_PORT, this.#config.SERVER_ADDRESS, () => {
            this.#logger.info(`Auth server running on: ${this.#config.SERVER_ADDRESS}:${this.#config.SERVER_PORT} 🔥 `);
        });
    }
}
