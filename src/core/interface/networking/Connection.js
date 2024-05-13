import { randomBytes, randomUUID } from 'crypto';
import ConnectionStatePacket from './packets/packet/out/ConnectionStatePacket.js';
import HandshakePacket from './packets/packet/bidirectional/HandshakePacket.js';

export default class Connection {
    #id;
    #state;
    #socket;
    #logger;
    #packets;

    #lastHandshake;

    constructor({ socket, logger, packets }) {
        this.#id = randomUUID();
        this.#socket = socket;
        this.#logger = logger;
        this.#packets = packets;
    }

    get lastHandshake() {
        return this.#lastHandshake;
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

    send(packet) {
        this.#logger.debug(`[OUT][PACKET] name: ${packet.name}`);
        this.#socket.write(packet.pack());
    }

    startHandShake() {
        const id = randomBytes(4).readUInt32LE();
        const handshake = new HandshakePacket({
            id,
            time: performance.now(),
            delta: 0,
        });
        this.#lastHandshake = handshake;
        this.send(handshake);
    }

    async onData(data, container) {
        const header = data[0];

        const packetExists = this.#packets.has(header);

        if (!packetExists) {
            this.#logger.debug(`[IN][PACKET] Unknow header packet: ${data[0]}`);
            return;
        }

        const { packet, createHandler } = this.#packets.get(header);
        this.#logger.debug(`[IN][PACKET] name: ${packet.name}`);
        const handler = createHandler(container);
        await handler.execute(this, packet.unpack(data));
    }
}
