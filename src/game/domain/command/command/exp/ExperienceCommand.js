import Command from '../../Command.js';
import ExperienceCommandValidator from './ExperienceCommandValidator.js';

export default class ExperienceCommand extends Command {
    constructor({ args }) {
        super({ args, validator: ExperienceCommandValidator });
    }

    static get name() {
        return '/exp';
    }
    static get description() {
        return 'add exp to other player or to yourself';
    }
    static get example() {
        return '/exp <number> <targetName>';
    }
}
