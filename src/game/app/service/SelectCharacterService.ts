import Result from "@/core/app/Result";
import Player from "@/core/domain/entities/game/player/Player";
import PlayerFactory from "@/core/domain/factories/PlayerFactory";
import ItemManager from "@/core/domain/manager/ItemManager";
import World from "@/core/domain/World";
import { ErrorTypesEnum } from "@/core/enum/ErrorTypesEnum";
import Logger from "@/core/infra/logger/Logger";
import PlayerRepository from "@/game/infra/database/PlayerRepository";

export default class SelectCharacterService {
    private readonly logger: Logger;
    private readonly playerRepository: PlayerRepository;
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

    async execute(slot: number, accountId: number): Promise<Result<Player, ErrorTypesEnum>> {
        const playerFounded = await this.playerRepository.getByAccountIdAndSlot(accountId, slot);

        if (!playerFounded) {
            this.logger.info(`[SelectCharacterService] Player not found, slot ${slot}.`);
            return Result.error(ErrorTypesEnum.PLAYER_NOT_FOUND);
        }

        const player = this.playerFactory.create({ ...playerFounded });

        player.setVirtualId(this.world.generateVirtualId());

        const items = await this.itemManager.getItems(player.getId());

        for (const item of items) {
            player.getInventory().addItemAt(item, item.getPosition());
        }

        return Result.ok(player);
    }
}
