import MathUtil from '../../../../../core/domain/util/MathUtil.js';
import ChatMessageTypeEnum from '../../../../../core/enum/ChatMessageTypeEnum.js';

export default class ItemCommandHandler {
    #logger;
    #itemManager;
    #itemRepository;

    constructor({ logger, itemManager, itemRepository }) {
        this.#logger = logger;
        this.#itemManager = itemManager;
        this.#itemRepository = itemRepository;
    }

    async execute(player, itemCommand) {
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
            player.chat({
                message: `Item: ${vnum} not found.`,
                messageType: ChatMessageTypeEnum.INFO,
            });
            return;
        }

        const item = this.#itemManager.getItem(vnum, Math.min(quantity, MathUtil.MAX_TINY));
        if (player.addItem(item)) {
            const id = await this.#itemRepository.create(item.toDatabase());
            item.dbId = id;
        }
    }
}
