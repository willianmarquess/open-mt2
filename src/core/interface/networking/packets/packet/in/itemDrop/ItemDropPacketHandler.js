export default class ItemDropPacketHandler {
    #logger;
    #dropItemService;

    constructor({ logger, dropItemService }) {
        this.#logger = logger;
        this.#dropItemService = dropItemService;
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

        this.#dropItemService.execute({ player, window, position, gold, count });
    }
}
