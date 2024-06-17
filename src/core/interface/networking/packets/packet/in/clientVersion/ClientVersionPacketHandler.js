export default class ClientVersionPacketHandler {
    #logger;

    constructor({ logger }) {
        this.#logger = logger;
    }

    async execute(connection, packet) {
        this.#logger.info(
            `[ClientVersionPacketHandler] Client version received, id: ${connection.id}, clientName: ${packet.clientName}, timestamp: ${packet.timeStamp}`,
        );
    }
}
