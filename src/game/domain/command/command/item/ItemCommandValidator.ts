import CommandValidator from "../../CommandValidator";

export default class ItemCommandValidator extends CommandValidator {
    build() {
        this.createRule(this.command.getArgs(), 'args').isRequired().isArray().build();
        this.createRule(this.command.getArgs()[0], 'vnum').isNumber().isRequired().build();
        this.createRule(this.command.getArgs()[1], 'quantity').isOptional().isNumber().build();
    }
}
