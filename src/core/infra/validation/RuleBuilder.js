import FluentValidator from './FluentValidator.js';

export default class RuleBuilder {
    #target;
    #errors;
    #targetName;
    #abstractValidator;
    #isOptional = false;

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
        if (typeof name !== 'string') throw new Error('targetName must be a string');
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

    #isNumber(value) {
        return (typeof value === 'number' && !isNaN(value)) || (typeof value === 'string' && !isNaN(parseFloat(value)));
    }

    isOptional() {
        this.#isOptional = true;
        return this;
    }

    #shouldSkipValidation() {
        return this.#isOptional && (this.#target === null || this.#target === undefined);
    }

    isString() {
        if (this.#shouldSkipValidation()) return this;
        if (typeof this.#target !== 'string') this.#errors.push({ error: `${this.#targetName} must be a string` });
        return this;
    }

    isNumber() {
        if (this.#shouldSkipValidation()) return this;
        if (!this.#isNumber(this.#target)) this.#errors.push({ error: `${this.#targetName} must be a number` });
        return this;
    }

    isArray() {
        if (this.#shouldSkipValidation()) return this;
        if (!Array.isArray(this.#target)) this.#errors.push({ error: `${this.#targetName} must be an array` });
        return this;
    }

    isBoolean() {
        if (this.#shouldSkipValidation()) return this;
        if (typeof this.#target !== 'boolean') this.#errors.push({ error: `${this.#targetName} must be a boolean` });
        return this;
    }

    isRequired() {
        if (this.#target === null || this.#target === undefined || this.#target === '') {
            this.#errors.push({ error: `${this.#targetName} is required` });
        }
        return this;
    }

    isRequiredIf(requiredFunction) {
        if (typeof requiredFunction !== 'function') {
            throw new Error('requiredFunction must be a function');
        }
        if (requiredFunction()) {
            this.isRequired();
        }
        return this;
    }

    isEqual(valueToCompare) {
        if (this.#shouldSkipValidation()) return this;
        if (this.#target !== valueToCompare)
            this.#errors.push({ error: `${this.#targetName} value must be equal to ${valueToCompare}` });
        return this;
    }

    isNotEqual(valueToCompare) {
        if (this.#shouldSkipValidation()) return this;
        if (this.#target === valueToCompare)
            this.#errors.push({ error: `${this.#targetName} value must not be equal to ${valueToCompare}` });
        return this;
    }

    isBetween(min, max) {
        if (this.#shouldSkipValidation()) return this;
        if (!this.#isNumber(this.#target) || Number(this.#target) < min || Number(this.#target) > max)
            this.#errors.push({ error: `${this.#targetName} value must be between ${min} and ${max}` });
        return this;
    }

    isGreaterThan(valueToCompare) {
        if (this.#shouldSkipValidation()) return this;
        if (!this.#isNumber(this.#target) || Number(this.#target) <= valueToCompare)
            this.#errors.push({ error: `${this.#targetName} value must be greater than ${valueToCompare}` });
        return this;
    }

    isGreaterThanOrEqual(valueToCompare) {
        if (this.#shouldSkipValidation()) return this;
        if (!this.#isNumber(this.#target) || Number(this.#target) < valueToCompare)
            this.#errors.push({
                error: `${this.#targetName} value must be greater than or equal to ${valueToCompare}`,
            });
        return this;
    }

    isLessThan(valueToCompare) {
        if (this.#shouldSkipValidation()) return this;
        if (!this.#isNumber(this.#target) || Number(this.#target) >= valueToCompare)
            this.#errors.push({ error: `${this.#targetName} value must be less than ${valueToCompare}` });
        return this;
    }

    isLessThanOrEqual(valueToCompare) {
        if (this.#shouldSkipValidation()) return this;
        if (!this.#isNumber(this.#target) || Number(this.#target) > valueToCompare)
            this.#errors.push({ error: `${this.#targetName} value must be less than or equal to ${valueToCompare}` });
        return this;
    }

    isInEnum(arrayWithAcceptableValues = []) {
        if (this.#shouldSkipValidation()) return this;
        if (!Array.isArray(arrayWithAcceptableValues)) {
            throw new Error('arrayWithAcceptableValues must be an array');
        }
        if (!arrayWithAcceptableValues.includes(this.#target)) {
            this.#errors.push({
                error: `${this.#targetName} value must be one of (${arrayWithAcceptableValues.join(', ')})`,
            });
        }
        return this;
    }

    isMust(validationFunction, message) {
        if (this.#shouldSkipValidation()) return this;
        if (typeof validationFunction !== 'function') {
            throw new Error('validationFunction must be a function');
        }
        if (!validationFunction(this.#target)) {
            this.#errors.push({ error: message });
        }
        return this;
    }

    build() {
        this.#abstractValidator.addRule(this);
    }
}
