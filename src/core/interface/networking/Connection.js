import { randomBytes, randomUUID } from 'crypto';
import ConnectionStatePacket from './packets/packet/out/ConnectionStatePacket.js';
import ConnectionStateEnum from '../../enum/ConnectionStateEnum.js';
import HandshakePacket from './packets/packet/bidirectional/handshake/HandshakePacket.js';

export default class Connection {
    #id;
    #state;
    #socket;
    #logger;

    #lastHandshake;

    constructor({ socket, logger }) {
        this.#id = randomUUID();
        this.#socket = socket;
        this.#logger = logger;
    }

    get socket() {
        return this.#socket;
    }

    get logger() {
        return this.#logger;
    }

    get lastHandshake() {
        return this.#lastHandshake;
    }

    set lastHandshake(value) {
        this.#lastHandshake = value;
    }

    get id() {
        return this.#id;
    }

    get state() {
        return this.#state;
    }

    set state(value) {
        this.#state = value;
        this.#updateState();
    }

    #updateState() {
        this.#logger.debug(`[OUT][STATE] value: ${this.#state}`);
        this.send(new ConnectionStatePacket({ state: this.#state }));
    }

    startHandShake() {
        this.state = ConnectionStateEnum.HANDSHAKE;
        const id = randomBytes(4).readUInt32LE();
        const handshake = new HandshakePacket({
            id,
            time: performance.now(),
            delta: 0,
        });
        this.#lastHandshake = handshake;
        this.send(handshake);
    }

    onHandshakeSuccess() {
        throw new Error('this method must be overwritten');
    }

    close() {
        this.#socket.destroy();
    }
}
