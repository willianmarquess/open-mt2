import CommandValidator from "../../CommandValidator";

export default class GotoCommandValidator extends CommandValidator {
    build() {
        this.createRule(this.command.getArgs(), 'args').isRequired().isArray().build();
        this.createRule(this.command.getArgs()[0], 'type')
            .isString()
            .isInEnum(['area', 'player', 'location'])
            .isRequired()
            .build();
        this.createRule(this.command.getArgs()[1], 'areaName')
            .isOptionalIf(() => this.command.getArgs()[0] !== 'area')
            .isString()
            .build();
        this.createRule(this.command.getArgs()[1], 'targetName')
            .isOptionalIf(() => this.command.getArgs()[0] !== 'player')
            .isString()
            .build();
        this.createRule(this.command.getArgs()[1], 'x')
            .isOptionalIf(() => this.command.getArgs()[0] !== 'location')
            .isString()
            .build();
        this.createRule(this.command.getArgs()[2], 'y')
            .isOptionalIf(() => this.command.getArgs()[0] !== 'location')
            .isString()
            .build();
    }
}
