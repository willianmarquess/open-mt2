import CommandValidator from '../../CommandValidator.js';

export default class StatCommandValidator extends CommandValidator {
    constructor(statCommand) {
        super(statCommand);
    }

    build() {
        this.createRule(this.command.args, 'args').isRequired().isArray().build();
        this.createRule(this.command.args[0], 'stat')
            .isOptional()
            .isString()
            .isInEnum(['ht', 'st', 'dx', 'iq'])
            .build();
        this.createRule(this.command.args[1], 'value').isOptional().isNumber().isGreaterThan(0).build();
    }
}
