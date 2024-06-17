import Command from './Command.js';
import FluentValidator from '../../../core/infra/validation/FluentValidator.js';

export default class CommandValidator extends FluentValidator {
    #command;

    constructor(command) {
        super();
        this.command = command;
    }

    set command(value) {
        if (!(value instanceof Command)) throw new Error('Command must be an instance of Command base class');
        this.#command = value;
    }

    get command() {
        return this.#command;
    }

    build() {
        throw new Error('Build method must be overridden');
    }
}
