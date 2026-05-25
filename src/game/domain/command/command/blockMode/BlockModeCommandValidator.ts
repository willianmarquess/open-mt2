import CommandValidator from '@/game/domain/command/CommandValidator';

export default class BlockModeCommandValidator extends CommandValidator {
    build() {
        this.createRule(this.command.getArgs(), 'args').isRequired().isArray().build();
        this.createRule(this.command.getArgs()[0], 'value').isNumber().isBetween(0, 64).build();
    }
}
