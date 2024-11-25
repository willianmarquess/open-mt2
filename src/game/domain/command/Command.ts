import CommandValidator from './CommandValidator.js';

export default class Command {
    private validator: any;
    args: any;

    constructor(args: any, validator: any) {
        this.args = args;
        if (validator) {
            this.validator = this.createValidator(validator);
        }
    }

    static get name() {
        throw new Error('this method must be overwritten');
    }

    static get description() {
        throw new Error('this method must be overwritten');
    }

    static get example() {
        return '';
    }

    isValid() {
        return this.validator.isValid();
    }

    errors() {
        return this.validator.getErrors();
    }

    private createValidator(validator: any) {
        const validatorInstance = new validator(this);
        if (!(validatorInstance instanceof CommandValidator)) {
            throw new Error('CommandValidator must be an instance of CommandValidator base class');
        }
        validatorInstance.build();
        return validatorInstance;
    }
}
