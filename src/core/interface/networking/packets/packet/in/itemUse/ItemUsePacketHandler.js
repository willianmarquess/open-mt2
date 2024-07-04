export default class ItemUsePacketHandler {
    #logger;

    constructor({ logger }) {
        this.#logger = logger;
    }

    async execute(connection, packet) {
        if (!packet.isValid()) {
            this.#logger.error(`[ItemUsePacketHandler] Packet invalid`);
            this.#logger.error(packet.errors());
            connection.close();
            return;
        }

        const { window, position } = packet;

        console.log(window, position);
    }
}
