import CommandValidator from '../../CommandValidator.js';

export default class InvokeCommandValidator extends CommandValidator {
    constructor(invokeCommand) {
        super(invokeCommand);
    }

    build() {
        this.createRule(this.command.args, 'args').isRequired().isArray().build();
        this.createRule(this.command.args[0], 'vnum').isNumber().isRequired().build();
        this.createRule(this.command.args[1], 'quantity').isOptional().isNumber().build();
    }
}
