import RuleBuilder from '@/core/infra/validation/RuleBuilder';

export default class FluentValidator {
    private rules: Array<RuleBuilder<any>>;

    constructor() {
        this.rules = [];
    }

    createRule<T>(value: T, name: string) {
        return new RuleBuilder(this, value, name);
    }

    addRule<T>(rule: RuleBuilder<T>) {
        this.rules.push(rule);
    }

    isValid() {
        return this.rules.every((r) => r.getErrors().length === 0);
    }

    getErrors() {
        const rulesWithError = this.rules.filter((r) => r.getErrors().length > 0);
        return rulesWithError.map((r) => ({
            name: r.getTargetName(),
            value: r.getTarget(),
            errors: r.getErrors(),
        }));
    }

    getFormattedErrorMessage() {
        const errors = this.getErrors();
        return errors.reduce((prev, curr) => {
            const fieldErrors = curr.errors.reduce((msg, err) => (msg += ` | ${err.error}`), `field: ${curr.name}`);
            return prev + fieldErrors + '\n';
        }, '');
    }
}
