import CommandValidator from '../../CommandValidator';

export default class HorseSetStatCommandValidator extends CommandValidator {
    build() {
        this.createRule(this.command.getArgs()[0], 'hp').isNumber().build();
        this.createRule(this.command.getArgs()[1], 'stamina').isNumber().build();
    }
}
