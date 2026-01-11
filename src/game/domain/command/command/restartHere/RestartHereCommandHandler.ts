import CommandHandler from '../../CommandHandler';
import Player from '@/core/domain/entities/game/player/Player';
import RestartHereCommand from './RestartHereCommand';

export default class RestartHereCommandHandler extends CommandHandler<RestartHereCommand> {
    async execute(player: Player) {
        player.restart('HERE');
    }
}
