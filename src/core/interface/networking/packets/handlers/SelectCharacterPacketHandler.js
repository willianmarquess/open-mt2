export default class SelectCharacterPacketHandler {
    #selectCharacterService;

    constructor({ selectCharacterService }) {
        this.#selectCharacterService = selectCharacterService;
    }

    async execute(connection, packet) {
        return this.#selectCharacterService.execute(connection, { slot: packet.slot });
    }
}
