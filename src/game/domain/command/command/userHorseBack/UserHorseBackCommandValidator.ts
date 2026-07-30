import CommandValidator from '../../CommandValidator';

export default class UserHorseBackCommandValidator extends CommandValidator {
    build() {
        this.createRule(this.command.getArgs()[0], 'targetName').isOptional().isString().build();
    }
}
