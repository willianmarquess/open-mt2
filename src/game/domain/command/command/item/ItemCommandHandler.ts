import Logger from "@/core/infra/logger/Logger";
import CommandHandler from "../../CommandHandler";
import ItemCommand from "./ItemCommand";
import ItemManager from "@/core/domain/manager/ItemManager";
import ItemRepository from "@/game/infra/database/ItemRepository";
import Player from "@/core/domain/entities/game/player/Player";
import { ChatMessageTypeEnum } from "@/core/enum/ChatMessageTypeEnum";
import MathUtil from "@/core/domain/util/MathUtil";

export default class ItemCommandHandler extends CommandHandler<ItemCommand> {
    private readonly logger: Logger;
    private readonly itemManager: ItemManager;
    private readonly itemRepository: ItemRepository;

    constructor({ logger, itemManager, itemRepository }) {
        super();
        this.logger = logger;
        this.itemManager = itemManager;
        this.itemRepository = itemRepository;
    }

    async execute(player: Player, itemCommand: ItemCommand) {
        if (!itemCommand.isValid()) {
            const errors = itemCommand.errors();
            this.logger.error(itemCommand.getErrorMessage());
            player.sendCommandErrors(errors);
            return;
        }

        const [vnum, quantity = 1] = itemCommand.getArgs();

        if (!this.itemManager.hasItem(vnum)) {
            player.chat({
                message: `Item: ${vnum} not found.`,
                messageType: ChatMessageTypeEnum.INFO,
            });
            return;
        }

        const item = this.itemManager.getItem(Number(vnum), Math.min(Number(quantity), MathUtil.MAX_TINY));
        if (player.addItem(item)) {
            const id = await this.itemRepository.create(item.toDatabase());
            item.setDbId(id);
        }
    }
}
