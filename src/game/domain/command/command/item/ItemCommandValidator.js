import CommandValidator from '../../CommandValidator.js';

export default class ItemCommandValidator extends CommandValidator {
    constructor(itemCommand) {
        super(itemCommand);
    }

    build() {
        this.createRule(this.command.args, 'args').isRequired().isArray().build();
        this.createRule(this.command.args[0], 'vnum').isNumber().isRequired().build();
        this.createRule(this.command.args[1], 'quantity').isOptional().isNumber().build();
    }
}
