import CommandValidator from '../../CommandValidator';

export default class SkillUpCommandValidator extends CommandValidator {
    build() {
        this.createRule(this.command.getArgs(), 'args').isRequired().isArray().build();
        this.createRule(this.command.getArgs()[0], 'id').isOptional().isNumber().isGreaterThan(0).build();
    }
}
