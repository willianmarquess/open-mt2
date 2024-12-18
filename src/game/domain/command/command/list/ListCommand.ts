import Command from "../../Command";
import ListCommandValidator from "./ListCommandValidator";

export default class ListCommand extends Command {
    constructor({ args }) {
        super({ args, validator: ListCommandValidator });
    }

    static getName() {
        return '/list';
    }
    static getDescription() {
        return 'list resources <areas, players>';
    }
    static getExample() {
        return '/list <areas, players>';
    }
}
