import CommandHandler from '../../CommandHandler';
import HorseStateCommand from './HorseStateCommand';
import Player from '@/core/domain/entities/game/player/Player';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';

export default class HorseStateCommandHandler extends CommandHandler<HorseStateCommand> {
    async execute(player: Player) {
        const level = player.getHorseLevel();
        const hp = player.getHorseHealth();
        const maxHp = player.getHorseMaxHealth();
        const st = player.getHorseStamina();
        const maxSt = player.getHorseMaxStamina();
        const hpPct = maxHp > 0 ? Math.floor((hp * 100) / maxHp) : 0;
        const stPct = maxSt > 0 ? Math.floor((st * 100) / maxSt) : 0;

        player.chat({ messageType: ChatMessageTypeEnum.INFO, message: 'Horse Information:' });
        player.chat({ messageType: ChatMessageTypeEnum.INFO, message: `    Level  ${level}` });
        player.chat({ messageType: ChatMessageTypeEnum.INFO, message: `    Health ${hp}/${maxHp} (${hpPct}%)` });
        player.chat({ messageType: ChatMessageTypeEnum.INFO, message: `    Stam   ${st}/${maxSt} (${stPct}%)` });
    }
}
