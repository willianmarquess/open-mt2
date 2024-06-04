import Result from '../../../core/app/Result.js';

export default class LoadCharactersService {
    #playerRepository;

    constructor({ playerRepository }) {
        this.#playerRepository = playerRepository;
    }

    async execute({ accountId }) {
        const players = await this.#playerRepository.getByAccountId(accountId);

        return Result.ok(players);
    }
}
