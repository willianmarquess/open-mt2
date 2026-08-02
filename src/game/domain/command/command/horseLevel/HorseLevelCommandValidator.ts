import CommandValidator from '../../CommandValidator';

export default class HorseLevelCommandValidator extends CommandValidator {
    build() {
        this.createRule(this.command.getArgs()[0], 'name').isString().build();
        this.createRule(this.command.getArgs()[1], 'level').isNumber().build();
    }
}
