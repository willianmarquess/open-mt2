import CommandValidator from '../../CommandValidator';

export default class UserHorseRideCommandValidator extends CommandValidator {
    build() {
        this.createRule(this.command.getArgs()[0], 'targetName').isOptional().isString().build();
    }
}
