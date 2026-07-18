import Command from '../../Command';
import HorseLevelCommandValidator from './HorseLevelCommandValidator';

export default class HorseLevelCommand extends Command {
    constructor({ args }: { args: Array<string> }) {
        super({ args, validator: HorseLevelCommandValidator });
    }

    static getName() {
        return '/horse_level';
    }

    static getDescription() {
        return "Set a player's horse level";
    }

    static getExample() {
        return '/horse_level <name> <level>';
    }
}
