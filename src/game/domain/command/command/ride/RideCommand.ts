import Command from '../../Command';
import RideCommandValidator from './RideCommandValidator';

export default class RideCommand extends Command {
    constructor({ args }: { args: Array<string> }) {
        super({ args, validator: RideCommandValidator });
    }

    static getName() {
        return '/ride';
    }

    static getDescription() {
        return 'Mount your horse';
    }

    static getExample() {
        return '/ride';
    }
}
