import RuleBuilder from './RuleBuilder.js';

export default class FluentValidator {
    constructor() {
        this.rules = [];
    }

    createRule(value, name) {
        return new RuleBuilder(this, value, name);
    }

    addRule(rule) {
        this.rules.push(rule);
    }

    isValid() {
        return this.rules.every((r) => r.errors.length === 0);
    }

    getErrors() {
        const rulesWithError = this.rules.filter((r) => r.errors.length > 0);
        return rulesWithError.map((r) => ({
            name: r.targetName,
            value: r.target,
            errors: r.errors,
        }));
    }
}
