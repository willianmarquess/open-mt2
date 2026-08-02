import Command from '../../Command';
import UserHorseFeedCommandValidator from './UserHorseFeedCommandValidator';

export default class UserHorseFeedCommand extends Command {
    constructor({ args }: { args: Array<string> }) {
        super({ args, validator: UserHorseFeedCommandValidator });
    }

    static getName() {
        return '/user_horse_feed';
    }

    static getDescription() {
        return 'Feed your summoned horse using the appropriate grade food from inventory';
    }

    static getExample() {
        return '/user_horse_feed';
    }
}
