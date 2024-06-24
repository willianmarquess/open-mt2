import Command from '../../Command.js';
import ListCommandValidator from './ListCommandValidator.js';

export default class ListCommand extends Command {
    constructor({ args }) {
        super({ args, validator: ListCommandValidator });
    }

    static get name() {
        return '/list';
    }
    static get description() {
        return 'list resources <areas, players>';
    }
    static get example() {
        return '/list <areas, players>';
    }
}
