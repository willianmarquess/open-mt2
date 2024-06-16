import Command from '../../Command.js';
import StatCommandValidator from './StatCommandValidator.js';

export default class StatCommand extends Command {
    constructor({ args }) {
        super({ args, validator: StatCommandValidator });
    }

    static get name() {
        return '/stat';
    }
    static get description() {
        return 'add points to a point status';
    }
    static get example() {
        return '/stat <ht, st, dx, it> <number>';
    }
}
