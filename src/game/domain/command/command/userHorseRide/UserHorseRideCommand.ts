import Command from '../../Command';

export default class UserHorseRideCommand extends Command {
    static getName() {
        return '/user_horse_ride';
    }

    static getDescription() {
        return 'Mount or dismount your horse';
    }

    static getExample() {
        return '/user_horse_ride';
    }
}
