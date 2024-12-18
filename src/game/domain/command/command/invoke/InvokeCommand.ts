import Command from "../../Command";
import InvokeCommandValidator from "./InvokeCommandValidator";

export default class InvokeCommand extends Command {
    constructor({ args }) {
        super({ args, validator: InvokeCommandValidator });
    }

    static getName() {
        return '/invoke';
    }
    static getDescription() {
        return 'invoke a mob with <vnum> and you can pass the quantity';
    }
    static getExample() {
        return '/invoke <vnum> <quantity>';
    }
}
