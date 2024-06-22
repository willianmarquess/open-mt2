import Command from '../../Command.js';
import LevelCommandValidator from './LevelCommandValidator.js';

export default class LevelCommand extends Command {
    constructor({ args }) {
        super({ args, validator: LevelCommandValidator });
    }

    static get name() {
        return '/lvl';
    }
    static get description() {
        return 'set level to other player or to yourself';
    }
    static get example() {
        return '/lvl <number> <targetName>';
    }
}
