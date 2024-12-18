import FluentValidator from '@/core/infra/validation/FluentValidator';
import Command from '@/game/domain/command/Command';

export default abstract class CommandValidator extends FluentValidator {
    protected command: Command;

    constructor(command: Command) {
        super();
        this.command = command;
    }

    setCommand(value: Command) {
        if (!(value instanceof Command)) throw new Error('Command must be an instance of Command base class');
        this.command = value;
    }

    getCommand() {
        return this.command;
    }

    build() {
        throw new Error('Build method must be overridden');
    }
}
