import Command from '../../Command';
import HorseSetStatCommandValidator from './HorseSetStatCommandValidator';

export default class HorseSetStatCommand extends Command {
    constructor({ args }: { args: Array<string> }) {
        super({ args, validator: HorseSetStatCommandValidator });
    }

    static getName() {
        return '/horse_set_stat';
    }

    static getDescription() {
        return 'Directly set your horse health and stamina';
    }

    static getExample() {
        return '/horse_set_stat <hp> <stamina>';
    }
}
