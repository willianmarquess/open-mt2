export default class ItemUsePacketHandler {
    #logger;
    #useItemService;

    constructor({ logger, useItemService }) {
        this.#logger = logger;
        this.#useItemService = useItemService;
    }

    async execute(connection, packet) {
        if (!packet.isValid()) {
            this.#logger.error(`[ItemUsePacketHandler] Packet invalid`);
            this.#logger.error(packet.errors());
            connection.close();
            return;
        }

        const { window, position } = packet;
        const { player } = connection;

        this.#useItemService.execute({ player, window, position });
    }
}
