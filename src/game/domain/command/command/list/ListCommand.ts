import Command from '../../Command';
import ListCommandValidator from './ListCommandValidator';

export default class ListCommand extends Command {
    constructor({ args }: { args: Array<string> }) {
        super({ args, validator: ListCommandValidator });
    }

    static getName() {
        return '/list';
    }
    static getDescription() {
        return 'list resources <areas, players, privileges>';
    }
    static getExample() {
        return '/list <areas, players, privileges>';
    }
}
