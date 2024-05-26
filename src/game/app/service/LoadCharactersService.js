import Result from '../../../core/app/Result.js';
import ErrorTypesEnum from '../../../core/enum/ErrorTypesEnum.js';

export default class LoadCharactersService {
    #logger;
    #playerRepository;

    constructor({ playerRepository, logger }) {
        this.#logger = logger;
        this.#playerRepository = playerRepository;
    }

    async execute({ accountId }) {
        const players = await this.#playerRepository.getByAccountId(accountId);

        if (players?.length < 1) {
            this.#logger.info(`[LoadCharactersService] Empty account.`);
            return Result.error(ErrorTypesEnum.EMPTY_ACCOUNT);
        }

        return Result.ok({
            players,
            empireId: players[0].empire,
        });
    }
}
