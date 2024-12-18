import CommandValidator from './CommandValidator';

type CommandArgs = {
    args?: Array<string>;
    validator?: new (command: Command) => CommandValidator;
};

export default abstract class Command {
    private args: Array<string>;
    private validator?: CommandValidator;

    constructor({ args = [], validator }: CommandArgs = {}) {
        this.args = args;

        if (validator) {
            this.validator = this.createValidator(validator);
        }
    }

    getArgs(): Array<string> {
        return this.args;
    }

    static getName(): string {
        throw new Error('This method must be overwritten in a subclass');
    }

    static getDescription(): string {
        throw new Error('This method must be overwritten in a subclass');
    }

    static getExample(): string {
        throw new Error('This method must be overwritten in a subclass');
    }

    isValid(): boolean {
        if (!this.validator) {
            throw new Error('Validator is not defined for this command');
        }
        return this.validator.isValid();
    }

    errors() {
        if (!this.validator) {
            throw new Error('Validator is not defined for this command');
        }
        return this.validator.getErrors();
    }

    getErrorMessage() {
        return this.validator.getFormattedErrorMessage();
    }

    private createValidator(ValidatorClass: new (command: this) => CommandValidator): CommandValidator {
        const validatorInstance = new ValidatorClass(this);

        if (!(validatorInstance instanceof CommandValidator)) {
            throw new Error('Validator must be an instance of CommandValidator base class');
        }

        validatorInstance.build();
        return validatorInstance;
    }
}