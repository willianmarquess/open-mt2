import Command from '../../Command.js';
import ItemCommandValidator from './ItemCommandValidator.js';

export default class ItemCommand extends Command {
    constructor({ args }) {
        super({ args, validator: ItemCommandValidator });
    }

    static get name() {
        return '/item';
    }
    static get description() {
        return 'create an item with <vnum> and you can pass the quantity';
    }
    static get example() {
        return '/item <vnum> <quantity>';
    }
}
