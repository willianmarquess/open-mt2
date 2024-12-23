import { expect } from 'chai';
import FluentValidator from '@/core/infra/validation/FluentValidator';
import RuleBuilder from '@/core/infra/validation/RuleBuilder';

describe('RuleBuilder', () => {
    let validator;

    beforeEach(() => {
        validator = new FluentValidator();
    });

    describe('Validation Methods', () => {
        it('should validate isString', () => {
            const rule = new RuleBuilder(validator, 'test', 'Target').isString();
            rule.build();
            expect(rule.getErrors()).to.be.empty;
        });

        it('should invalidate isString', () => {
            const rule = new RuleBuilder(validator, 123, 'Target').isString();
            rule.build();
            expect(rule.getErrors()).to.have.lengthOf(1);
            expect(rule.getErrors()[0].error).to.equal('Target must be a string');
        });

        it('should validate isNumber', () => {
            const rule = new RuleBuilder(validator, 123, 'Target').isNumber();
            rule.build();
            expect(rule.getErrors()).to.be.empty;
        });

        it('should validate isNumber with string number', () => {
            const rule = new RuleBuilder(validator, '123', 'Target').isNumber();
            rule.build();
            expect(rule.getErrors()).to.be.empty;
        });

        it('should invalidate isNumber', () => {
            const rule = new RuleBuilder(validator, 'abc', 'Target').isNumber();
            rule.build();
            expect(rule.getErrors()).to.have.lengthOf(1);
            expect(rule.getErrors()[0].error).to.equal('Target must be a number');
        });

        it('should validate isArray', () => {
            const rule = new RuleBuilder(validator, [1, 2, 3], 'Target').isArray();
            rule.build();
            expect(rule.getErrors()).to.be.empty;
        });

        it('should invalidate isArray', () => {
            const rule = new RuleBuilder(validator, 'abc', 'Target').isArray();
            rule.build();
            expect(rule.getErrors()).to.have.lengthOf(1);
            expect(rule.getErrors()[0].error).to.equal('Target must be an array');
        });

        it('should validate isBoolean', () => {
            const rule = new RuleBuilder(validator, true, 'Target').isBoolean();
            rule.build();
            expect(rule.getErrors()).to.be.empty;
        });

        it('should invalidate isBoolean', () => {
            const rule = new RuleBuilder(validator, 'abc', 'Target').isBoolean();
            rule.build();
            expect(rule.getErrors()).to.have.lengthOf(1);
            expect(rule.getErrors()[0].error).to.equal('Target must be a boolean');
        });
    });

    describe('Presence Validation', () => {
        it('should validate isRequired', () => {
            const rule = new RuleBuilder(validator, 'test', 'Target').isRequired();
            rule.build();
            expect(rule.getErrors()).to.be.empty;
        });

        it('should invalidate isRequired', () => {
            const rule = new RuleBuilder(validator, '', 'Target').isRequired();
            rule.build();
            expect(rule.getErrors()).to.have.lengthOf(1);
            expect(rule.getErrors()[0].error).to.equal('Target is required');
        });

        it('should validate isRequiredIf', () => {
            const rule = new RuleBuilder(validator, 'test', 'Target').isRequiredIf(() => true);
            rule.build();
            expect(rule.getErrors()).to.be.empty;
        });

        it('should invalidate isRequiredIf', () => {
            const rule = new RuleBuilder(validator, '', 'Target').isRequiredIf(() => true);
            rule.build();
            expect(rule.getErrors()).to.have.lengthOf(1);
            expect(rule.getErrors()[0].error).to.equal('Target is required');
        });
    });

    describe('Equality and Inequality Validation', () => {
        it('should validate isEqual', () => {
            const rule = new RuleBuilder(validator, 10, 'Target').isEqual(10);
            rule.build();
            expect(rule.getErrors()).to.be.empty;
        });

        it('should invalidate isEqual', () => {
            const rule = new RuleBuilder(validator, 10, 'Target').isEqual(20);
            rule.build();
            expect(rule.getErrors()).to.have.lengthOf(1);
            expect(rule.getErrors()[0].error).to.equal('Target value must be equal to 20');
        });

        it('should validate isNotEqual', () => {
            const rule = new RuleBuilder(validator, 10, 'Target').isNotEqual(20);
            rule.build();
            expect(rule.getErrors()).to.be.empty;
        });

        it('should invalidate isNotEqual', () => {
            const rule = new RuleBuilder(validator, 10, 'Target').isNotEqual(10);
            rule.build();
            expect(rule.getErrors()).to.have.lengthOf(1);
            expect(rule.getErrors()[0].error).to.equal('Target value must not be equal to 10');
        });
    });

    describe('Numeric Validation', () => {
        it('should validate isBetween', () => {
            const rule = new RuleBuilder(validator, 15, 'Target').isBetween(10, 20);
            rule.build();
            expect(rule.getErrors()).to.be.empty;
        });

        it('should invalidate isBetween', () => {
            const rule = new RuleBuilder(validator, 5, 'Target').isBetween(10, 20);
            rule.build();
            expect(rule.getErrors()).to.have.lengthOf(1);
            expect(rule.getErrors()[0].error).to.equal('Target value must be between 10 and 20');
        });

        it('should validate isGreaterThan', () => {
            const rule = new RuleBuilder(validator, 15, 'Target').isGreaterThan(10);
            rule.build();
            expect(rule.getErrors()).to.be.empty;
        });

        it('should invalidate isGreaterThan', () => {
            const rule = new RuleBuilder(validator, 5, 'Target').isGreaterThan(10);
            rule.build();
            expect(rule.getErrors()).to.have.lengthOf(1);
            expect(rule.getErrors()[0].error).to.equal('Target value must be greater than 10');
        });

        it('should validate isGreaterThanOrEqual', () => {
            const rule = new RuleBuilder(validator, 15, 'Target').isGreaterThanOrEqual(10);
            rule.build();
            expect(rule.getErrors()).to.be.empty;
        });

        it('should invalidate isGreaterThanOrEqual', () => {
            const rule = new RuleBuilder(validator, 5, 'Target').isGreaterThanOrEqual(10);
            rule.build();
            expect(rule.getErrors()).to.have.lengthOf(1);
            expect(rule.getErrors()[0].error).to.equal('Target value must be greater than or equal to 10');
        });

        it('should validate isLessThan', () => {
            const rule = new RuleBuilder(validator, 5, 'Target').isLessThan(10);
            rule.build();
            expect(rule.getErrors()).to.be.empty;
        });

        it('should invalidate isLessThan', () => {
            const rule = new RuleBuilder(validator, 15, 'Target').isLessThan(10);
            rule.build();
            expect(rule.getErrors()).to.have.lengthOf(1);
            expect(rule.getErrors()[0].error).to.equal('Target value must be less than 10');
        });

        it('should validate isLessThanOrEqual', () => {
            const rule = new RuleBuilder(validator, 5, 'Target').isLessThanOrEqual(10);
            rule.build();
            expect(rule.getErrors()).to.be.empty;
        });

        it('should invalidate isLessThanOrEqual', () => {
            const rule = new RuleBuilder(validator, 15, 'Target').isLessThanOrEqual(10);
            rule.build();
            expect(rule.getErrors()).to.have.lengthOf(1);
            expect(rule.getErrors()[0].error).to.equal('Target value must be less than or equal to 10');
        });
    });

    describe('Enum Validation', () => {
        it('should validate isInEnum', () => {
            const rule = new RuleBuilder(validator, 'apple', 'Target').isInEnum(['apple', 'banana', 'orange']);
            rule.build();
            expect(rule.getErrors()).to.be.empty;
        });

        it('should invalidate isInEnum', () => {
            const rule = new RuleBuilder(validator, 'pear', 'Target').isInEnum(['apple', 'banana', 'orange']);
            rule.build();
            expect(rule.getErrors()).to.have.lengthOf(1);
            expect(rule.getErrors()[0].error).to.equal('Target value must be one of (apple, banana, orange)');
        });
    });

    describe('Custom Validation', () => {
        it('should validate isMust', () => {
            const rule = new RuleBuilder(validator, 15, 'Target').isMust(
                (value) => value > 10,
                'Value must be greater than 10',
            );
            rule.build();
            expect(rule.getErrors()).to.be.empty;
        });

        it('should invalidate isMust', () => {
            const rule = new RuleBuilder(validator, 5, 'Target').isMust(
                (value) => value > 10,
                'Value must be greater than 10',
            );
            rule.build();
            expect(rule.getErrors()).to.have.lengthOf(1);
            expect(rule.getErrors()[0].error).to.equal('Value must be greater than 10');
        });
    });
});
