import Command from '../../Command';
import ItemCommandValidator from './ItemCommandValidator';

export default class ItemCommand extends Command {
    constructor({ args }) {
        super({ args, validator: ItemCommandValidator });
    }

    static getName() {
        return '/item';
    }
    static getDescription() {
        return 'create an item with <vnum> and you can pass the quantity';
    }
    static getExample() {
        return '/item <vnum> <quantity>';
    }
}
