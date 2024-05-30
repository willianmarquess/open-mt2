/**
 * @typedef {Object} container
 * @property {CreateCharacterService} createCharacterService - The use case instance for creating characters.
 */

export default class CreateCharacterPacketHandler {
    #createCharacterService;

    /**
     * Creates an instance of CreateCharacterPacketHandler.
     *
     * @param {container} dependencies - The dependencies required by the handler.
     * @param {createCharacterService} dependencies.createCharacterService - The use case instance for creating characters.
     */
    constructor({ createCharacterService }) {
        this.#createCharacterService = createCharacterService;
    }

    async execute(connection, packet) {
        const { playerName, playerClass, appearance, slot } = packet;
        return this.#createCharacterService.execute(connection, {
            playerName,
            playerClass,
            appearance,
            slot,
        });
    }
}
