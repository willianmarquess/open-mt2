import CommandValidator from '../../CommandValidator';

export default class LevelCommandValidator extends CommandValidator {
    build() {
        this.createRule(this.command.getArgs(), 'args').isRequired().isArray().build();
        this.createRule(this.command.getArgs()[0], 'value').isNumber().isGreaterThanOrEqual(1).build();
        this.createRule(this.command.getArgs()[1], 'targetName').isOptional().isString().build();
    }
}
