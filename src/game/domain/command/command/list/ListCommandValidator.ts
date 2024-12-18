import CommandValidator from '../../CommandValidator';

export default class ListCommandValidator extends CommandValidator {
    build() {
        this.createRule(this.command.getArgs(), 'args').isRequired().isArray().build();
        this.createRule(this.command.getArgs()[0], 'type')
            .isString()
            .isInEnum(['areas', 'players'])
            .isRequired()
            .build();
    }
}
