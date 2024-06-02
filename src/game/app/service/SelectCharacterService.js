import ConnectionStateEnum from '../../../core/enum/ConnectionStateEnum.js';

export default class SelectCharacterService {
    #logger;
    #playerRepository;
    #playerFactory;
    #world;

    constructor({ playerRepository, logger, playerFactory, world }) {
        this.#logger = logger;
        this.#playerRepository = playerRepository;
        this.#playerFactory = playerFactory;
        this.#world = world;
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

        const player = this.#playerFactory.create({ ...playerFounded, virtualId: this.#world.generateVirtualId() });
        connection.player = player;
        player.init();
    }
}
