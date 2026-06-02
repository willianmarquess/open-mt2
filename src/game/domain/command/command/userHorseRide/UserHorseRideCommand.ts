import Command from '../../Command';
import UserHorseRideCommandValidator from './UserHorseRideCommandValidator';

export default class UserHorseRideCommand extends Command {
    constructor({ args }: { args: Array<string> }) {
        super({ args, validator: UserHorseRideCommandValidator });
    }

    static getName() {
        return '/user_horse_ride';
    }

    static getDescription() {
        return 'Make a player (or yourself) mount their horse';
    }

    static getExample() {
        return '/user_horse_ride <targetName>';
    }
}
