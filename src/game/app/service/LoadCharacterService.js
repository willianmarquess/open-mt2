import Result from '../../../core/app/Result.js';
import ErrorTypesEnum from '../../../core/enum/ErrorTypesEnum.js';

export default class LoadCharacterService {
    #logger;
    #playerRepository;

    constructor({ playerRepository, logger }) {
        this.#logger = logger;
        this.#playerRepository = playerRepository;
    }

    async execute({ accountId, slot }) {
        const player = await this.#playerRepository.getByAccountIdAndSlot(accountId, slot);

        if (!player) {
            this.#logger.info(`[LoadCharacterService] Player not found, slot ${slot}.`);
            return Result.error(ErrorTypesEnum.PLAYER_NOT_FOUND);
        }

        return Result.ok(player);
    }
}
