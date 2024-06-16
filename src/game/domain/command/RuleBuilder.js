import FluentValidator from './FluentValidator.js';

export default class RuleBuilder {
    #target;
    #errors;
    #targetName;
    #abstractValidator;

    constructor(abstractValidator, target, targetName) {
        this.#target = target;
        this.#errors = [];
        this.targetName = targetName;
        this.abstractValidator = abstractValidator;
    }

    get errors() {
        return this.#errors;
    }

    set targetName(name) {
        if (typeof name !== 'string') throw new Error('targetName must be an string');
        this.#targetName = name;
    }

    get targetName() {
        return this.#targetName;
    }

    set abstractValidator(validator) {
        if (!(validator instanceof FluentValidator))
            throw new Error('abstractValidator must be an instance of FluentValidator class');
        this.#abstractValidator = validator;
    }

    get abstractValidator() {
        return this.#abstractValidator;
    }

    isString() {
        if (typeof this.#target !== 'string') this.#errors.push({ error: `${this.#targetName} must be a String` });
        return this;
    }

    isNumber() {
        if (typeof this.#target !== 'number') this.#errors.push({ error: `${this.#targetName} must be a Number` });
        return this;
    }

    isArray() {
        if (!Array.isArray(this.#target)) this.#errors.push({ error: `${this.#targetName} must be an Array` });
        return this;
    }

    isBoolean() {
        if (typeof this.#target !== 'boolean') this.#errors.push({ error: `${this.#targetName} must be a Boolean` });
        return this;
    }

    isRequired() {
        if (!this.#target) this.#errors.push({ error: `${this.#targetName} is required` });
        return this;
    }

    isRequiredIf(requiredFunction) {
        if (requiredFunction()) {
            this.isRequired();
        }
        return this;
    }

    isEquals(valueToCompare) {
        if (this.#target !== valueToCompare)
            this.#errors.push({ error: `${this.#targetName} value must be equal ${valueToCompare}` });
        return this;
    }

    isNotEquals(valueToCompare) {
        if (this.#target === valueToCompare)
            this.#errors.push({ error: `${this.#targetName} value must not be equal ${valueToCompare}` });
        return this;
    }

    isBetween(min, max) {
        if (typeof this.#target !== 'number' || this.#target < min || this.#target > max)
            this.#errors.push({ error: `${this.#targetName} value must be between ${min} and ${max}` });
        return this;
    }

    isGreaterThan(valueToCompare) {
        if (typeof this.#target !== 'number' || this.#target <= valueToCompare)
            this.#errors.push({ error: `${this.#targetName} value must be greater than ${valueToCompare}` });
        return this;
    }

    isGreaterThanOrEquals(valueToCompare) {
        if (typeof this.#target !== 'number' || this.#target < valueToCompare)
            this.#errors.push({ error: `${this.#targetName} value must be greater than or equal ${valueToCompare}` });
        return this;
    }

    isLessThan(valueToCompare) {
        if (typeof this.#target !== 'number' || this.#target >= valueToCompare)
            this.#errors.push({ error: `${this.#targetName} value must be less than ${valueToCompare}` });
        return this;
    }

    isLessThanOrEquals(valueToCompare) {
        if (typeof this.#target !== 'number' || this.#target > valueToCompare)
            this.#errors.push({ error: `${this.#targetName} value must be less than or equal ${valueToCompare}` });
        return this;
    }

    isInEnum(arrayWithAcceptableValues = []) {
        if (!arrayWithAcceptableValues.includes(this.#target))
            this.#errors.push({
                error: `${this.#targetName} value must be one of those (${arrayWithAcceptableValues.reduce((acc, curr) => ` [${curr}] `, '')})`,
            });
        return this;
    }

    isMust(validationFunction, message) {
        if (typeof validationFunction !== 'function') throw new Error('validationFunction must be an function');
        if (!validationFunction()) this.#errors.push({ error: message });
        return this;
    }

    build() {
        this.#abstractValidator.addRule(this);
    }
}
