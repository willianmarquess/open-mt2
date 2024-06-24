import CommandValidator from '../../CommandValidator.js';

export default class ListCommandValidator extends CommandValidator {
    constructor(listCommand) {
        super(listCommand);
    }

    build() {
        this.createRule(this.command.args, 'args').isRequired().isArray().build();
        this.createRule(this.command.args[0], 'type').isString().isInEnum(['areas', 'players']).isRequired().build();
    }
}
