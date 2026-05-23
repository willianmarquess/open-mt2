import Logger from '@/core/infra/logger/Logger';
import CommandHandler from '../../CommandHandler';
import PolymorphCommand from './PolymorphCommand';
import MobManager from '@/core/domain/manager/MobManager';
import Player from '@/core/domain/entities/game/player/Player';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';

export default class PolymorphCommandHandler extends CommandHandler<PolymorphCommand> {
    private readonly logger: Logger;
    private readonly mobManager: MobManager;

    constructor({ logger, mobManager }: { logger: Logger; mobManager: MobManager }) {
        super();
        this.logger = logger;
        this.mobManager = mobManager;
    }

    async execute(player: Player, command: PolymorphCommand) {
        if (!command.isValid()) {
            player.sendCommandErrors(command.errors());
            return;
        }

        const [vnumStr] = command.getArgs();
        const vnum = Number(vnumStr);

        if (vnum === 0) {
            player.setPolymorph(0);
            player.chat({ messageType: ChatMessageTypeEnum.INFO, message: 'Polymorph removed.' });
            return;
        }

        if (!this.mobManager.hasMob(vnum)) {
            player.chat({ messageType: ChatMessageTypeEnum.INFO, message: `Mob vnum ${vnum} not found.` });
            return;
        }

        player.setPolymorph(vnum);
        this.logger.info(`[PolymorphCommand] ${player.getName()} polymorphed into vnum ${vnum}`);
    }
}
