import CommandValidator from '../../CommandValidator';

export default class PolymorphCommandValidator extends CommandValidator {
    build() {
        this.createRule(this.command.getArgs(), 'args').isRequired().isArray().build();
        this.createRule(this.command.getArgs()[0], 'vnum').isNumber().isRequired().build();
    }
}
