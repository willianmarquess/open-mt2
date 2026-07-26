import Logger from '@/core/infra/logger/Logger';
import CommandHandler from '../../CommandHandler';
import InvokeCommand from './InvokeCommand';
import World from '@/core/domain/World';
import MobManager from '@/core/domain/manager/MobManager';
import Player from '@/core/domain/entities/game/player/Player';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import MathUtil from '@/core/domain/util/MathUtil';
import { EntityManager } from '@/core/domain/manager/EntityManager';

const MAX_MOB_TO_INVOKE = 20;
const MAX_MOB_INVOKE_DISTANCE = 700;

export default class InvokeCommandHandler extends CommandHandler<InvokeCommand> {
    private readonly logger: Logger;
    private readonly world: World;
    private readonly mobManager: MobManager;
    private readonly entityManager: EntityManager;

    constructor({
        logger,
        world,
        mobManager,
        entityManager,
    }: {
        logger: Logger;
        world: World;
        mobManager: MobManager;
        entityManager: EntityManager;
    }) {
        super();
        this.logger = logger;
        this.world = world;
        this.mobManager = mobManager;
        this.entityManager = entityManager;
    }

    async execute(player: Player, invokeCommand: InvokeCommand) {
        if (!invokeCommand.isValid()) {
            const errors = invokeCommand.errors();
            this.logger.error(invokeCommand.getErrorMessage());
            player.sendCommandErrors(errors);
            return;
        }

        const [vnum, quantity = 1] = invokeCommand.getArgs();

        if (!this.mobManager.hasMob(Number(vnum))) {
            player.chat({
                message: `Mob: ${vnum} not found.`,
                messageType: ChatMessageTypeEnum.INFO,
            });
            return;
        }

        for (let i = 0; i < Math.min(Number(quantity), MAX_MOB_TO_INVOKE); i++) {
            const positionX = MathUtil.getRandomInt(
                player.getPositionX() - MAX_MOB_INVOKE_DISTANCE,
                player.getPositionX() + MAX_MOB_INVOKE_DISTANCE,
            );

            const positionY = MathUtil.getRandomInt(
                player.getPositionY() - MAX_MOB_INVOKE_DISTANCE,
                player.getPositionY() + MAX_MOB_INVOKE_DISTANCE,
            );

            const mob = this.entityManager.createMob({
                id: Number(vnum),
                positionX,
                positionY,
                direction: 0,
            });

            if (!mob) {
                this.logger.error(`[InvokeCommandHandler] Failed to create mob with vnum ${vnum}`);
                continue;
            }

            this.world.spawn(mob);
        }
    }
}
