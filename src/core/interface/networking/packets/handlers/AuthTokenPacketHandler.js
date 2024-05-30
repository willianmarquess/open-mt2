export default class AuthTokenPacketHandler {
    #loadCharactersService;

    constructor({ loadCharactersService }) {
        this.#loadCharactersService = loadCharactersService;
    }

    async execute(connection, packet) {
        const { key, username } = packet;
        return this.#loadCharactersService.execute(connection, { key, username });
    }
}
