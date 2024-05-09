import { randomBytes, randomUUID } from 'crypto';
import ConnectionStatePacket from './packets/ConnectionStatePacket.js';
import HandshakePacket from './packets/HandshakePacket.js';

export class Connection {
    #id;
    #state;
    #socket;
    #logger;
    #packets;

    constructor({ socket, logger, packets }) {
        this.#id = randomUUID();
        this.#socket = socket;
        this.#logger = logger;
        this.#packets = packets;
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
        this.send(new ConnectionStatePacket({ state: this.#state }));
    }

    send(packet) {
        this.#logger.info(`[OUT][PACKET] name: ${packet.name}`);
        this.#socket.write(packet.pack());
    }

    startHandShake() {
        const id = randomBytes(4).readUInt32LE();
        this.send(
            new HandshakePacket({
                id,
                time: performance.now(),
                delta: 0,
            }),
        );
    }

    onData(data) {
        const header = data[0];

        const packet = this.#packets.get(header);

        if (packet) {
            this.#logger.info(`[IN][PACKET] name: ${packet.name}`);
            console.log(packet.unpack(data));
            this.#logger.info(packet.unpack(data));
        }
    }
}
