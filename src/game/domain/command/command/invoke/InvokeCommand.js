import Command from '../../Command.js';
import InvokeCommandValidator from './InvokeCommandValidator.js';

export default class InvokeCommand extends Command {
    constructor({ args }) {
        super({ args, validator: InvokeCommandValidator });
    }

    static get name() {
        return '/invoke';
    }
    static get description() {
        return 'invoke a mob with <vnum> and you can pass the quantity';
    }
    static get example() {
        return '/invoke <vnum> <quantity>';
    }
}
