export default class TokenPacketHandler {
    #logger;

    constructor({ logger }) {
        this.#logger = logger;
    }

    async execute(connection, packet) {
        console.log(packet.username);
        console.log(packet.Xteakeys);
        console.log(packet.key);
    }
}
