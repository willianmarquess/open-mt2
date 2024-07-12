import Result from '../../../core/app/Result.js';
import ErrorTypesEnum from '../../../core/enum/ErrorTypesEnum.js';

export default class SelectCharacterService {
    #logger;
    #playerRepository;
    #playerFactory;
    #world;
    #itemManager;

    constructor({ playerRepository, logger, playerFactory, world, itemManager }) {
        this.#logger = logger;
        this.#playerRepository = playerRepository;
        this.#playerFactory = playerFactory;
        this.#world = world;
        this.#itemManager = itemManager;
    }

    async execute({ slot, accountId }) {
        const playerFounded = await this.#playerRepository.getByAccountIdAndSlot(accountId, slot);

        if (!playerFounded) {
            this.#logger.info(`[SelectCharacterService] Player not found, slot ${slot}.`);
            return Result.error(ErrorTypesEnum.PLAYER_NOT_FOUND);
        }

        const player = this.#playerFactory.create({ ...playerFounded, virtualId: this.#world.generateVirtualId() });
        const items = await this.#itemManager.getItems(player.id);

        for (const item of items) {
            player.inventory.addItemAt(item, item.position);
        }

        return Result.ok(player);
    }
}
