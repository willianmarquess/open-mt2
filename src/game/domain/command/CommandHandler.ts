import Player from '@/core/domain/entities/game/player/Player';
import Command from './Command';

export default abstract class CommandHandler<T extends Command> {
    abstract execute(player: Player, command: T): Promise<void>;
}