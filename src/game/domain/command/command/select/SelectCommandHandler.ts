import CommandHandler from '../../CommandHandler';
import Player from '@/core/domain/entities/game/player/Player';
import SelectCommand from './SelectCommand';

export default class SelectCommandHandler extends CommandHandler<SelectCommand> {
    async execute(player: Player) {
        player.backToSelect();
    }
}
