import { randomUUID } from 'crypto';
import ConnectionStatePacket from './packets/packet/out/ConnectionStatePacket.js';

export default class Connection {
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
        this.#logger.debug(`[OUT][STATE] value: ${this.#state}`);
        this.send(new ConnectionStatePacket({ state: this.#state }));
    }

    send(packet) {
        this.#logger.debug(`[OUT][PACKET] name: ${packet.name}`);
        this.#socket.write(packet.pack());
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
