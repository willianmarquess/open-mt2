import CommandHandler from '../../CommandHandler';
import Player from '@/core/domain/entities/game/player/Player';
import RestartTownCommand from './RestartTownCommand';

export default class RestartTownCommandHandler extends CommandHandler<RestartTownCommand> {
    async execute(player: Player) {
        player.restart('TOWN');
    }
}
