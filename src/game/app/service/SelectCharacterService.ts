import Result from '@/core/domain/util/Result';
import Player from '@/core/domain/entities/game/player/Player';
import PlayerFactory from '@/core/domain/factories/PlayerFactory';
import ItemManager from '@/core/domain/manager/ItemManager';
import World from '@/core/domain/World';
import { ErrorTypesEnum } from '@/core/enum/ErrorTypesEnum';
import Logger from '@/core/infra/logger/Logger';
import { IPlayerRepository } from '@/core/domain/repository/IPlayerRepository';
import GameConnection from '@/game/interface/networking/GameConnection';

export default class SelectCharacterService {
    private readonly logger: Logger;
    private readonly playerRepository: IPlayerRepository;
    private readonly playerFactory: PlayerFactory;
    private readonly world: World;
    private readonly itemManager: ItemManager;

    constructor({ playerRepository, logger, playerFactory, world, itemManager }) {
        this.logger = logger;
        this.playerRepository = playerRepository;
        this.playerFactory = playerFactory;
        this.world = world;
        this.itemManager = itemManager;
    }

    async execute(
        slot: number,
        accountId: number,
        connection: GameConnection,
    ): Promise<Result<Player, ErrorTypesEnum>> {
        const playerFounded = await this.playerRepository.getByAccountIdAndSlot(accountId, slot);

        if (!playerFounded) {
            this.logger.info(`[SelectCharacterService] Player not found, slot ${slot}.`);
            return Result.error(ErrorTypesEnum.PLAYER_NOT_FOUND);
        }

        const player = this.playerFactory.create({ ...playerFounded });

        player.setVirtualId(this.world.generateVirtualId());

        connection.setPlayer(player);

        player.sendDetails();

        const items = await this.itemManager.getItems(player.getId());

        player.addItems(items);
        player.sendPoints();

        return Result.ok(player);
    }
}
