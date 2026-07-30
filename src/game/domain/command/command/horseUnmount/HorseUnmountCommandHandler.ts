import CommandHandler from '../../CommandHandler';
import HorseUnmountCommand from './HorseUnmountCommand';
import Player from '@/core/domain/entities/game/player/Player';

export default class HorseUnmountCommandHandler extends CommandHandler<HorseUnmountCommand> {
    async execute(player: Player, command: HorseUnmountCommand) {
        if (!command.isValid()) {
            player.sendCommandErrors(command.errors());
            return;
        }

        player.stopRiding();
    }
}
