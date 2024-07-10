export default class ItemPickupPacketHandler {
    #logger;
    #pickupItemService;

    constructor({ logger, pickupItemService }) {
        this.#logger = logger;
        this.#pickupItemService = pickupItemService;
    }

    async execute(connection, packet) {
        if (!packet.isValid()) {
            this.#logger.error(`[ItemPickupPacketHandler] Packet invalid`);
            this.#logger.error(packet.errors());
            connection.close();
            return;
        }

        const { virtualId } = packet;
        const { player } = connection;

        this.#pickupItemService.execute({ player, virtualId });
    }
}
