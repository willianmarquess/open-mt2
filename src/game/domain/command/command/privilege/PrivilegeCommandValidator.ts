import CommandValidator from '../../CommandValidator';

export default class PrivilegeCommandValidator extends CommandValidator {
    build() {
        this.createRule(this.command.getArgs(), 'args').isRequired().isArray().build();
        this.createRule(this.command.getArgs()[0], 'kind')
            .isRequired()
            .isString()
            .isInEnum(['player', 'empire', 'guild'])
            .build();
        this.createRule(this.command.getArgs()[1], 'playerName, empireName, guildName').isRequired().isString().build();
        this.createRule(this.command.getArgs()[2], 'type')
            .isRequired()
            .isString()
            .isInEnum(['exp', 'gold', 'drop', 'gold5', 'gold10', 'gold50'])
            .build();
        this.createRule(this.command.getArgs()[3], 'value').isRequired().isNumber().isGreaterThan(0).build();
        this.createRule(this.command.getArgs()[4], 'timeInSeconds').isRequired().isNumber().isGreaterThan(0).build();
    }
}
