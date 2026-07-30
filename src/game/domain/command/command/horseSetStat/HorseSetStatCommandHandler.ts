import CommandHandler from '../../CommandHandler';
import HorseSetStatCommand from './HorseSetStatCommand';
import Player from '@/core/domain/entities/game/player/Player';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';

export default class HorseSetStatCommandHandler extends CommandHandler<HorseSetStatCommand> {
    async execute(player: Player, command: HorseSetStatCommand) {
        if (!command.isValid()) {
            player.sendCommandErrors(command.errors());
            return;
        }

        const [hpStr, staminaStr] = command.getArgs();
        const hp = Number(hpStr);
        const stamina = Number(staminaStr);

        player.setHorseHealth(hp);
        player.setHorseStamina(stamina);

        player.chat({
            messageType: ChatMessageTypeEnum.INFO,
            message: `Horse stats set: HP=${hp}, Stamina=${stamina}`,
        });
    }
}
