export default class ItemMovePacketHandler {
    #logger;
    #moveItemService;

    constructor({ logger, moveItemService }) {
        this.#logger = logger;
        this.#moveItemService = moveItemService;
    }

    async execute(connection, packet) {
        if (!packet.isValid()) {
            this.#logger.error(`[ItemMovePacketHandler] Packet invalid`);
            this.#logger.error(packet.errors());
            connection.close();
            return;
        }

        const { fromWindow, fromPosition, toWindow, toPosition, count } = packet;
        const { player } = connection;

        this.#moveItemService.execute({ player, fromWindow, fromPosition, toWindow, toPosition, count });
    }
}
