export default class EnterGamePacketHandler {
    #logger;

    constructor({ logger }) {
        this.#logger = logger;
    }

    async execute(connection, packet) {
        this.#logger.info(`[EnterGamePacketHandler] enter game received, id: ${connection.id}, packet: ${packet}`);
    }
}
