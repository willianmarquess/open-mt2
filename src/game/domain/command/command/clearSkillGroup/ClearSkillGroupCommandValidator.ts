import CommandValidator from '../../CommandValidator';

export default class ClearSkillGroupCommandValidator extends CommandValidator {
    build() {
        this.createRule(this.command.getArgs(), 'args').isRequired().isArray().build();
        this.createRule(this.command.getArgs()[0], 'playerName').isOptional().isString().build();
    }
}
