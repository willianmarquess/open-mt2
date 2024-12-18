import Player from "@/core/domain/entities/game/player/Player";
import ItemManager from "@/core/domain/manager/ItemManager";
import Logger from "@/core/infra/logger/Logger";

type MoveItemServiceParams = {
    player: Player,
    fromWindow: number,
    fromPosition: number,
    toWindow: number,
    toPosition: number,
    /*count*/
}

export default class MoveItemService {
    private readonly logger: Logger;
    private readonly itemManager: ItemManager;

    constructor({ logger, itemManager }) {
        this.logger = logger;
        this.itemManager = itemManager;
    }

    async execute({ player, fromWindow, fromPosition, toWindow, toPosition }: MoveItemServiceParams) {
        this.logger.debug(`[MoveItemService] moving item from ${fromPosition} to ${toPosition}`);

        const updatedItem = player.moveItem({ fromWindow, fromPosition, toWindow, toPosition });

        if (updatedItem) {
            await this.itemManager.update(updatedItem);
        }
    }
}
