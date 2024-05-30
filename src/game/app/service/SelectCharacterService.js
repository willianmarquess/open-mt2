import ConnectionStateEnum from '../../../core/enum/ConnectionStateEnum.js';

export default class SelectCharacterService {
    #logger;
    #playerRepository;
    #spawnCharacterService;

    constructor({ playerRepository, logger, spawnCharacterService }) {
        this.#logger = logger;
        this.#playerRepository = playerRepository;
        this.#spawnCharacterService = spawnCharacterService;
    }

    async execute(connection, { slot }) {
        const { accountId } = connection;
        if (!accountId) {
            this.#logger.info(`[SelectCharacterService] The connection does not have an accountId, this cannot happen`);
            connection.close();
            return;
        }

        connection.state = ConnectionStateEnum.LOADING;
        const playerFounded = await this.#playerRepository.getByAccountIdAndSlot(accountId, slot);

        if (!playerFounded) {
            this.#logger.info(`[SelectCharacterService] Player not found, slot ${slot}.`);
            connection.close();
            return;
        }

        return this.#spawnCharacterService.execute(connection, playerFounded);
    }
}
