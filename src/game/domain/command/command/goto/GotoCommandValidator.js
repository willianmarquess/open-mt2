import CommandValidator from '../../CommandValidator.js';

export default class GotoCommandValidator extends CommandValidator {
    constructor(gotoCommand) {
        super(gotoCommand);
    }

    build() {
        this.createRule(this.command.args, 'args').isRequired().isArray().build();
        this.createRule(this.command.args[0], 'type')
            .isString()
            .isInEnum(['area', 'player', 'location'])
            .isRequired()
            .build();
        this.createRule(this.command.args[1], 'areaName')
            .isOptionalIf(() => this.command.args[0] !== 'area')
            .isString()
            .build();
        this.createRule(this.command.args[1], 'targetName')
            .isOptionalIf(() => this.command.args[0] !== 'player')
            .isString()
            .build();
        this.createRule(this.command.args[1], 'x')
            .isOptionalIf(() => this.command.args[0] !== 'location')
            .isString()
            .build();
        this.createRule(this.command.args[2], 'y')
            .isOptionalIf(() => this.command.args[0] !== 'location')
            .isString()
            .build();
    }
}
