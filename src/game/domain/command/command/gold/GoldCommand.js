import Command from '../../Command.js';
import GoldCommandValidator from './GoldCommandValidator.js';

export default class GoldCommand extends Command {
    constructor({ args }) {
        super({ args, validator: GoldCommandValidator });
    }

    static get name() {
        return '/gold';
    }
    static get description() {
        return 'add gold to other player or to yourself';
    }
    static get example() {
        return '/gold <number> <targetName>';
    }
}
