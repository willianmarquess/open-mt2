import { StatsEnum } from "@/core/enum/StatsEnum";
import CommandValidator from "../../CommandValidator";

export default class StatCommandValidator extends CommandValidator {
    build() {
        this.createRule(this.command.getArgs(), 'args').isRequired().isArray().build();
        this.createRule(this.command.getArgs()[0], 'stat')
            .isOptional()
            .isString()
            .isInEnum(Object.values(StatsEnum))
            .build();
        this.createRule(this.command.getArgs()[1], 'value').isOptional().isNumber().isGreaterThan(0).build();
    }
}
