import MathUtil from '../../../../../core/domain/util/MathUtil.js';
import ChatMessageTypeEnum from '../../../../../core/enum/ChatMessageTypeEnum.js';

const MAX_MOB_TO_INVOKE = 20;

export default class InvokeCommandHandler {
    #logger;
    #world;
    #mobManager;

    constructor({ logger, world, mobManager }) {
        this.#logger = logger;
        this.#world = world;
        this.#mobManager = mobManager;
    }

    execute(player, invokeCommand) {
        if (!invokeCommand.isValid()) {
            const errors = invokeCommand.errors();
            this.#logger.error(errors);
            player.sendCommandErrors(errors);
            return;
        }

        const {
            args: [vnum, quantity = 1],
        } = invokeCommand;

        if (!this.#mobManager.hasMob(vnum)) {
            player.say({
                message: `Mob: ${vnum} not found.`,
                messageType: ChatMessageTypeEnum.INFO,
            });
            return;
        }

        for (let i = 0; i < Math.max(quantity, MAX_MOB_TO_INVOKE); i++) {
            const positionX = MathUtil.getRandomInt(player.positionX + 150, player.positionX + 1500);
            const positionY = MathUtil.getRandomInt(player.positionY + 150, player.positionY + 1500);
            const mob = this.#mobManager.getMob(vnum, positionX, positionY);
            this.#world.spawn(mob);
        }
    }
}
