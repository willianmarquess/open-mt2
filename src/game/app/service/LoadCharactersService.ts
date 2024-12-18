import Result from "@/core/app/Result";
import Player from "@/core/domain/entities/game/player/Player";
import PlayerRepository from "@/game/infra/database/PlayerRepository";

export default class LoadCharactersService {
    private readonly playerRepository: PlayerRepository;

    constructor({ playerRepository }) {
        this.playerRepository = playerRepository;
    }

    async execute({ accountId }): Promise<Result<Array<Player>, any>> {
        const players = await this.playerRepository.getByAccountId(accountId);
        return Result.ok(players);
    }
}
