import Result from "@/core/app/Result";
import Player from "@/core/domain/entities/game/player/Player";
import PlayerFactory from "@/core/domain/factories/PlayerFactory";
import { ErrorTypesEnum } from "@/core/enum/ErrorTypesEnum";
import CacheProvider from "@/core/infra/cache/CacheProvider";
import Logger from "@/core/infra/logger/Logger";
import CacheKeyGenerator from "@/core/util/CacheKeyGenerator";
import PlayerRepository from "@/game/infra/database/PlayerRepository";

const MAX_PLAYERS_PER_ACCOUNT = 4;

type CreateCharacterServiceParams = {
    playerName: string, 
    playerClass: number, 
    appearance: number, 
    slot: number, 
    accountId: number
}

export default class CreateCharacterService {
    private readonly logger: Logger;
    private readonly cacheProvider: CacheProvider;
    private readonly playerRepository: PlayerRepository;
    private readonly playerFactory: PlayerFactory;

    constructor({ logger, cacheProvider, playerRepository, playerFactory }) {
        this.logger = logger;
        this.cacheProvider = cacheProvider;
        this.playerRepository = playerRepository;
        this.playerFactory = playerFactory;
    }

    async execute({ playerName, playerClass, appearance, slot, accountId }: CreateCharacterServiceParams): Promise<Result<Player, ErrorTypesEnum>> {
        const nameAlreadyExists = await this.playerRepository.nameAlreadyExists(playerName);

        if (nameAlreadyExists) {
            this.logger.info(`[CreateCharacterService] The player name: ${playerName} already exists.`);
            return Result.error(ErrorTypesEnum.NAME_ALREADY_EXISTS);
        }

        const players = await this.playerRepository.getByAccountId(accountId);

        if (players.length > MAX_PLAYERS_PER_ACCOUNT) {
            this.logger.info(`[CreateCharacterService] The player account is full`);
            return Result.error(ErrorTypesEnum.ACCOUNT_FULL);
        }

        const key = CacheKeyGenerator.createEmpireKey(accountId);
        const empireIdExists = await this.cacheProvider.exists(key);

        if (!empireIdExists) {
            this.logger.info(`[CreateCharacterService] The empire was not selected before.`);
            return Result.error(ErrorTypesEnum.EMPIRE_NOT_SELECTED);
        }

        const empireId = await this.cacheProvider.get<number>(key);

        const player = this.playerFactory.create({
            playerClass,
            empire: empireId,
            name: playerName,
            accountId,
            appearance,
            slot,
        });

        const playerId = await this.playerRepository.create(player.toDatabase());
        player.setId(playerId);

        return Result.ok(player);
    }
}
