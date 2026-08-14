import Command from '../../Command';

export default class UserHorseBackCommand extends Command {
    static getName() {
        return '/user_horse_back';
    }

    static getDescription() {
        return 'Send your horse away';
    }

    static getExample() {
        return '/user_horse_back';
    }
}
