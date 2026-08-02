import Command from '../../Command';
import UserHorseBackCommandValidator from './UserHorseBackCommandValidator';

export default class UserHorseBackCommand extends Command {
    constructor({ args }: { args: Array<string> }) {
        super({ args, validator: UserHorseBackCommandValidator });
    }

    static getName() {
        return '/user_horse_back';
    }

    static getDescription() {
        return 'Dismount a player (or yourself) from their horse';
    }

    static getExample() {
        return '/user_horse_back <targetName>';
    }
}
