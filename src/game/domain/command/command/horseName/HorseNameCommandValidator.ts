import CommandValidator from '../../CommandValidator';

export default class HorseNameCommandValidator extends CommandValidator {
    build() {
        this.createRule(this.command.getArgs()[0], 'name').isRequired().isString().build();
    }
}
