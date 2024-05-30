export default class EnterGamePacketHandler {
    #enterGameService;

    constructor({ enterGameService }) {
        this.#enterGameService = enterGameService;
    }

    async execute(connection) {
        return this.#enterGameService.execute(connection);
    }
}
