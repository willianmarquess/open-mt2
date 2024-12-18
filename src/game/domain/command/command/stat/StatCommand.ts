import Command from '../../Command';
import StatCommandValidator from './StatCommandValidator';

export default class StatCommand extends Command {
    constructor({ args }) {
        super({ args, validator: StatCommandValidator });
    }

    static getName() {
        return '/stat';
    }
    static getDescription() {
        return 'add points to a point status';
    }
    static getExample() {
        return '/stat <ht, st, dx, it> <number>';
    }
}
