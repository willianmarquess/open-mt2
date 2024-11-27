export default class AttackPacketHandler {
    #logger;
    #characterAttackService;

    constructor({ logger, characterAttackService }) {
        this.#logger = logger;
        this.#characterAttackService = characterAttackService;
    }

    async execute(connection, packet) {
        if (!packet.isValid()) {
            this.#logger.error(`[AttackPacketHandler] Packet invalid`);
            this.#logger.error(packet.errors());
            connection.close();
            return;
        }

        const { player } = connection;

        if (!player) {
            this.#logger.info(`[AttackPacketHandler] The connection does not have a player select, this cannot happen`);
            connection.close();
            return;
        }

        const { attackType, victimVirtualId } = packet;
        await this.#characterAttackService.execute({ player, attackType, victimVirtualId });
    }
}
