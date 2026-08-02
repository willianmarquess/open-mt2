import Command from '../../Command';
import SkillUpCommandValidator from './SkillUpCommandValidator';

export default class SkillUpCommand extends Command {
    constructor({ args }: { args: Array<string> }) {
        super({ args, validator: SkillUpCommandValidator });
    }

    static getName() {
        return '/skillup';
    }
    static getDescription() {
        return 'add points to a skill';
    }
    static getExample() {
        return '/skillup idx';
    }
}
