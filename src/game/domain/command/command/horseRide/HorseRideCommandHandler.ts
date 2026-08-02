import CommandHandler from '../../CommandHandler';
import HorseRideCommand from './HorseRideCommand';
import Player from '@/core/domain/entities/game/player/Player';

export default class HorseRideCommandHandler extends CommandHandler<HorseRideCommand> {
    async execute(player: Player, command: HorseRideCommand) {
        if (!command.isValid()) {
            player.sendCommandErrors(command.errors());
            return;
        }

        player.toggleRiding();
    }
}
