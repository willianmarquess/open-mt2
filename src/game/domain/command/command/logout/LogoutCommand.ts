import Command from "../../Command";

export default class LogoutCommand extends Command {
    static getName() {
        return '/logout';
    }
    static getDescription() {
        return 'logout the account';
    }
}
