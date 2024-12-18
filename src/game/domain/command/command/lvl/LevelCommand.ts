import Command from "../../Command";
import LevelCommandValidator from "./LevelCommandValidator";

export default class LevelCommand extends Command {
    constructor({ args }) {
        super({ args, validator: LevelCommandValidator });
    }

    static getName() {
        return '/lvl';
    }
    static getDescription() {
        return 'set level to other player or to yourself';
    }
    static getExample() {
        return '/lvl <number> <targetName>';
    }
}
