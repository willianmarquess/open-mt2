export default class ItemDropPacketHandler {
    #logger;

    constructor({ logger }) {
        this.#logger = logger;
    }

    async execute(connection, packet) {
        if (!packet.isValid()) {
            this.#logger.error(`[ItemDropPacketHandler] Packet invalid`);
            this.#logger.error(packet.errors());
            connection.close();
            return;
        }

        const { window, position, gold, count } = packet;
        const { player } = connection;
        console.log({ window, position, gold, count });
        player.dropItem({ window, position, gold, count });
    }
}
