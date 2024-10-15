import MathUtil from '../../../../../core/domain/util/MathUtil.js';
import ChatMessageTypeEnum from '../../../../../core/enum/ChatMessageTypeEnum.js';

const MAX_MOB_TO_INVOKE = 20;
const MAX_MOB_INVOKE_DISTANCE = 700;

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

        for (let i = 0; i < Math.min(quantity, MAX_MOB_TO_INVOKE); i++) {
            const positionX = MathUtil.getRandomInt(
                player.positionX - MAX_MOB_INVOKE_DISTANCE,
                player.positionX + MAX_MOB_INVOKE_DISTANCE,
            );
            const positionY = MathUtil.getRandomInt(
                player.positionY - MAX_MOB_INVOKE_DISTANCE,
                player.positionY + MAX_MOB_INVOKE_DISTANCE,
            );
            const mob = this.#mobManager.getMob(vnum, positionX, positionY);
            mob.virtualId = this.#world.generateVirtualId();
            this.#world.spawn(mob);
        }
    }
}
