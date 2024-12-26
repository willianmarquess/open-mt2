import Result from '@/core/domain/util/Result';
import PlayerState from '@/core/domain/entities/state/player/PlayerState';
import { IPlayerRepository } from '@/core/domain/repository/IPlayerRepository';

export default class LoadCharactersService {
    private readonly playerRepository: IPlayerRepository;

    constructor({ playerRepository }) {
        this.playerRepository = playerRepository;
    }

    async execute({ accountId }): Promise<Result<Array<PlayerState>, void>> {
        const players = await this.playerRepository.getByAccountId(accountId);
        return Result.ok(players);
    }
}
