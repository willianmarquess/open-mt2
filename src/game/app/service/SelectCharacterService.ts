import Result from '@/core/domain/util/Result';
import Player from '@/core/domain/entities/game/player/Player';
import ItemManager from '@/core/domain/manager/ItemManager';
import { ErrorTypesEnum } from '@/core/enum/ErrorTypesEnum';
import Logger from '@/core/infra/logger/Logger';
import { IPlayerRepository } from '@/core/domain/repository/IPlayerRepository';
import GameConnection from '@/game/interface/networking/GameConnection';
import Item from '@/core/domain/entities/game/item/Item';
import { EntityManager } from '@/core/domain/manager/EntityManager';

export default class SelectCharacterService {
    private readonly logger: Logger;
    private readonly playerRepository: IPlayerRepository;
    private readonly itemManager: ItemManager;
    private readonly entityManager: EntityManager;

    constructor({
        playerRepository,
        logger,
        itemManager,
        entityManager,
    }: {
        playerRepository: IPlayerRepository;
        logger: Logger;
        itemManager: ItemManager;
        entityManager: EntityManager;
    }) {
        this.logger = logger;
        this.playerRepository = playerRepository;
        this.itemManager = itemManager;
        this.entityManager = entityManager;
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

        const player = this.entityManager.createPlayer({ ...playerFounded });

        connection.setPlayer(player);

        player.sendDetails();

        const items = await this.itemManager.getItems(player.getId());

        if (items.length > 0) {
            this.logger.debug(`[SelectCharacterService] Player ${player.getName()} has ${items.length} items to load.`);
            player.addItems(items as Item[]);
        }

        player.sendPoints();

        return Result.ok(player);
    }
}
