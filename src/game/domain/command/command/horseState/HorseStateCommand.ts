import Command from '../../Command';
import HorseStateCommandValidator from './HorseStateCommandValidator';

export default class HorseStateCommand extends Command {
    constructor({ args }: { args: Array<string> }) {
        super({ args, validator: HorseStateCommandValidator });
    }

    static getName() {
        return '/horse_state';
    }

    static getDescription() {
        return 'Print your horse level, health and stamina info';
    }

    static getExample() {
        return '/horse_state';
    }
}
