import { randomBytes } from 'node:crypto';
import { createServer } from 'node:net';

export default class AuthServer {
    #server;
    #connections = new Map();
    #logger;
    #config;

    constructor({ logger, config }) {
        this.#logger = logger;
        this.#config = config;
    }

    setup() {
        this.#server = createServer(this.#onListener.bind(this));
        return this;
    }

    #onListener(socket) {
        const connection = {};
        this.#connections.set(connection.id, connection);

        connection.setPhase({});
        this.#startHandShake(connection);

        socket.on('close', this.#onClose.bind(this, connection));
        socket.on('data', this.#onData.bind(this, connection));
    }

    #onClose(connection) {
        this.#logger.info(`closing connection: ID: ${connection.id}`);
        this.#connections.delete(connection.id);
    }

    #onData(connection, data) {
        this.#logger.info('DATA >>>', data);
    }

    #startHandShake(connection) {
        const id = randomBytes(4).readUInt32LE();
        connection.send(
            {},
            {
                id,
                delta: 0,
                time: 122619,
            },
        );
    }

    start() {
        this.#server.listen(this.#config.SERVER_PORT, this.#config.SERVER_ADDRESS, () => {
            this.#logger.info(`auth server running on: ${this.#config.SERVER_ADDRESS}:${this.#config.SERVER_PORT} 🔥 `);
        });
    }
}
