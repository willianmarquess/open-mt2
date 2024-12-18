import Command from "../../Command";
import GoldCommandValidator from "./GoldCommandValidator";

export default class GoldCommand extends Command {
    constructor({ args }) {
        super({ args, validator: GoldCommandValidator });
    }

    static getName() {
        return '/gold';
    }
    static getDescription() {
        return 'add gold to other player or to yourself';
    }
    static getExample() {
        return '/gold <number> <targetName>';
    }
}
