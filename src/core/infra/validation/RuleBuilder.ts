import FluentValidator from '@/core/infra/validation/FluentValidator';

interface ValidationError {
    error: string;
}

export default class RuleBuilder<T> {
    private target: T;
    private errors: ValidationError[];
    private targetName: string;
    private abstractValidator: FluentValidator;
    private isOptionalFlag: boolean = false;

    constructor(abstractValidator: FluentValidator, target: T, targetName: string) {
        this.target = target;
        this.errors = [];
        this.targetName = targetName;
        this.abstractValidator = abstractValidator;
    }

    getErrors(): ValidationError[] {
        return this.errors;
    }

    setTargetName(name: string): void {
        if (typeof name !== 'string') {
            throw new Error('targetName must be a string');
        }
        this.targetName = name;
    }

    getTargetName(): string {
        return this.targetName;
    }

    getTarget() {
        return this.target;
    }

    setAbstractValidator(validator: FluentValidator): void {
        if (!(validator instanceof FluentValidator)) {
            throw new Error('abstractValidator must be an instance of FluentValidator class');
        }
        this.abstractValidator = validator;
    }

    getAbstractValidator(): FluentValidator {
        return this.abstractValidator;
    }

    private validateNumber(value: any): boolean {
        return (typeof value === 'number' && !isNaN(value)) || (typeof value === 'string' && !isNaN(parseFloat(value)));
    }

    isOptional(): this {
        this.isOptionalFlag = true;
        return this;
    }

    isOptionalIf(optionalFunction: () => boolean): this {
        if (typeof optionalFunction !== 'function') {
            throw new Error('optionalFunction must be a function');
        }
        if (optionalFunction()) {
            this.isOptional();
        }
        return this;
    }

    private shouldSkipValidation(): boolean {
        return this.isOptionalFlag && (this.target === null || this.target === undefined);
    }

    isString(): this {
        if (this.shouldSkipValidation()) return this;
        if (typeof this.target !== 'string') {
            this.errors.push({ error: `${this.targetName} must be a string` });
        }
        return this;
    }

    isNumber(): this {
        if (this.shouldSkipValidation()) return this;
        if (!this.validateNumber(this.target)) {
            this.errors.push({ error: `${this.targetName} must be a number` });
        }
        return this;
    }

    isArray(): this {
        if (this.shouldSkipValidation()) return this;
        if (!Array.isArray(this.target)) {
            this.errors.push({ error: `${this.targetName} must be an array` });
        }
        return this;
    }

    isBoolean(): this {
        if (this.shouldSkipValidation()) return this;
        if (typeof this.target !== 'boolean') {
            this.errors.push({ error: `${this.targetName} must be a boolean` });
        }
        return this;
    }

    isRequired(): this {
        if (this.target === null || this.target === undefined || this.target === '') {
            this.errors.push({ error: `${this.targetName} is required` });
        }
        return this;
    }

    isRequiredIf(requiredFunction: () => boolean): this {
        if (typeof requiredFunction !== 'function') {
            throw new Error('requiredFunction must be a function');
        }
        if (requiredFunction()) {
            this.isRequired();
        }
        return this;
    }

    isEqual(valueToCompare: any): this {
        if (this.shouldSkipValidation()) return this;
        if (this.target !== valueToCompare) {
            this.errors.push({ error: `${this.targetName} value must be equal to ${valueToCompare}` });
        }
        return this;
    }

    isNotEqual(valueToCompare: any): this {
        if (this.shouldSkipValidation()) return this;
        if (this.target === valueToCompare) {
            this.errors.push({ error: `${this.targetName} value must not be equal to ${valueToCompare}` });
        }
        return this;
    }

    isBetween(min: number, max: number): this {
        if (this.shouldSkipValidation()) return this;
        if (!this.validateNumber(this.target) || Number(this.target) < min || Number(this.target) > max) {
            this.errors.push({ error: `${this.targetName} value must be between ${min} and ${max}` });
        }
        return this;
    }

    isGreaterThan(valueToCompare: number): this {
        if (this.shouldSkipValidation()) return this;
        if (!this.validateNumber(this.target) || Number(this.target) <= valueToCompare) {
            this.errors.push({ error: `${this.targetName} value must be greater than ${valueToCompare}` });
        }
        return this;
    }

    isGreaterThanOrEqual(valueToCompare: number): this {
        if (this.shouldSkipValidation()) return this;
        if (!this.validateNumber(this.target) || Number(this.target) < valueToCompare) {
            this.errors.push({
                error: `${this.targetName} value must be greater than or equal to ${valueToCompare}`,
            });
        }
        return this;
    }

    isLessThan(valueToCompare: number): this {
        if (this.shouldSkipValidation()) return this;
        if (!this.validateNumber(this.target) || Number(this.target) >= valueToCompare) {
            this.errors.push({ error: `${this.targetName} value must be less than ${valueToCompare}` });
        }
        return this;
    }

    isLessThanOrEqual(valueToCompare: number): this {
        if (this.shouldSkipValidation()) return this;
        if (!this.validateNumber(this.target) || Number(this.target) > valueToCompare) {
            this.errors.push({ error: `${this.targetName} value must be less than or equal to ${valueToCompare}` });
        }
        return this;
    }

    isInEnum(arrayWithAcceptableValues: any[] = []): this {
        if (this.shouldSkipValidation()) return this;
        if (!Array.isArray(arrayWithAcceptableValues)) {
            throw new Error('arrayWithAcceptableValues must be an array');
        }
        if (!arrayWithAcceptableValues.includes(this.target)) {
            this.errors.push({
                error: `${this.targetName} value must be one of (${arrayWithAcceptableValues.join(', ')})`,
            });
        }
        return this;
    }

    isMust(validationFunction: (value: any) => boolean, message: string): this {
        if (this.shouldSkipValidation()) return this;
        if (typeof validationFunction !== 'function') {
            throw new Error('validationFunction must be a function');
        }
        if (!validationFunction(this.target)) {
            this.errors.push({ error: message });
        }
        return this;
    }

    build(): void {
        this.abstractValidator.addRule(this);
    }
}
