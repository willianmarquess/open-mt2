import CommandValidator from '../../CommandValidator.js';

export default class StatCommandValidator extends CommandValidator {
    constructor(statCommand) {
        super(statCommand);
    }

    build() {
        this.createRule(this.command.args, 'args').isRequired().isArray().build();
        this.createRule(this.command.args[0], 'stat').isString().isInEnum(['ht', 'st', 'dx', 'iq']).build();
        this.createRule(this.command.args[1], 'value')
            .isRequiredIf(() => !!this.command.args[0])
            .isNumber()
            .isGreaterThan(0)
            .build();
    }
}
