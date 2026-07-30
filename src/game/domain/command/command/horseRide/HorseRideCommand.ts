import Command from '../../Command';
import HorseRideCommandValidator from './HorseRideCommandValidator';

export default class HorseRideCommand extends Command {
    constructor({ args }: { args: Array<string> }) {
        super({ args, validator: HorseRideCommandValidator });
    }

    static getName() {
        return '/horse_ride';
    }

    static getDescription() {
        return 'Toggle horse riding on yourself';
    }

    static getExample() {
        return '/horse_ride';
    }
}
