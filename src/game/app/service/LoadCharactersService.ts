import Result from '@/core/app/Result';
import PlayerState from '@/core/domain/entities/state/player/PlayerState';
import PlayerRepository from '@/game/infra/database/PlayerRepository';

export default class LoadCharactersService {
    private readonly playerRepository: PlayerRepository;

    constructor({ playerRepository }) {
        this.playerRepository = playerRepository;
    }

    async execute({ accountId }): Promise<Result<Array<PlayerState>, void>> {
        const players = await this.playerRepository.getByAccountId(accountId);
        return Result.ok(players);
    }
}
