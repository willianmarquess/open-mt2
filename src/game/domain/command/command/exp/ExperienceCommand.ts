import Command from '../../Command';
import ExperienceCommandValidator from './ExperienceCommandValidator';

export default class ExperienceCommand extends Command {
    constructor({ args }) {
        super({ args, validator: ExperienceCommandValidator });
    }

    static getName() {
        return '/exp';
    }
    static getDescription() {
        return 'add exp to other player or to yourself';
    }
    static getExample() {
        return '/exp <number> <targetName>';
    }
}
