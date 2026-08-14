import CommandHandler from '../../CommandHandler';
import UserHorseRideCommand from './UserHorseRideCommand';
import Player from '@/core/domain/entities/game/player/Player';

export default class UserHorseRideCommandHandler extends CommandHandler<UserHorseRideCommand> {
    async execute(player: Player) {
        player.toggleRiding();
    }
}
