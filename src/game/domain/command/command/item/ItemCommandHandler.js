import ChatMessageTypeEnum from '../../../../../core/enum/ChatMessageTypeEnum.js';

const MAX_ITEM_TO_INSTANTIATE = 5;

export default class ItemCommandHandler {
    #logger;
    #itemManager;

    constructor({ logger, itemManager }) {
        this.#logger = logger;
        this.#itemManager = itemManager;
    }

    execute(player, itemCommand) {
        if (!itemCommand.isValid()) {
            const errors = itemCommand.errors();
            this.#logger.error(errors);
            player.sendCommandErrors(errors);
            return;
        }

        const {
            args: [vnum, quantity = 1],
        } = itemCommand;

        if (!this.#itemManager.hasItem(vnum)) {
            player.say({
                message: `Item: ${vnum} not found.`,
                messageType: ChatMessageTypeEnum.INFO,
            });
            return;
        }

        for (let i = 0; i < Math.min(quantity, MAX_ITEM_TO_INSTANTIATE); i++) {
            const item = this.#itemManager.getItem(vnum);
            player.addItem(item);
        }
    }
}
