export default class TargetPacketHandler {
    #logger;
    #characterUpdateTargetService;

    constructor({ logger, characterUpdateTargetService }) {
        this.#logger = logger;
        this.#characterUpdateTargetService = characterUpdateTargetService;
    }

    async execute(connection, packet) {
        if (!packet.isValid()) {
            this.#logger.error(`[TargetPacketHandler] Packet invalid`);
            this.#logger.error(packet.errors());
            connection.close();
            return;
        }

        const { player } = connection;

        if (!player) {
            this.#logger.info(
                `[TargetPacketHandler] The connection does not have a player selected, this cannot happen`,
            );
            connection.close();
            return;
        }

        const { targetVirtualId } = packet;
        await this.#characterUpdateTargetService.execute({ player, targetVirtualId });
    }
}
