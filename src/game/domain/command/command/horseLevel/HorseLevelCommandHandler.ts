import CommandHandler from '../../CommandHandler';
import HorseLevelCommand from './HorseLevelCommand';
import Player from '@/core/domain/entities/game/player/Player';
import World from '@/core/domain/World';
import Logger from '@/core/infra/logger/Logger';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';

export default class HorseLevelCommandHandler extends CommandHandler<HorseLevelCommand> {
    private readonly logger: Logger;
    private readonly world: World;

    constructor({ logger, world }: { logger: Logger; world: World }) {
        super();
        this.logger = logger;
        this.world = world;
    }

    async execute(player: Player, command: HorseLevelCommand) {
        if (!command.isValid()) {
            player.sendCommandErrors(command.errors());
            return;
        }

        const [targetName, levelStr] = command.getArgs();
        const target = this.world.getPlayerByName(targetName);

        if (!target) {
            player.chat({ messageType: ChatMessageTypeEnum.INFO, message: `Target: ${targetName} not found.` });
            return;
        }

        const level = Number(levelStr);
        target.setHorseLevel(level);

        player.chat({
            messageType: ChatMessageTypeEnum.INFO,
            message: `horse level set (${target.getName()}: ${target.getHorseLevel()})`,
        });
        this.logger.info(`[HorseLevelCommand] ${player.getName()} set horse level of ${target.getName()} to ${level}`);
    }
}
