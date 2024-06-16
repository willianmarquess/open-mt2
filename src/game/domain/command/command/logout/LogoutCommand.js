import Command from '../../Command.js';

export default class LogoutCommand extends Command {
    static get name() {
        return '/logout';
    }
    static get description() {
        return 'logout the account';
    }
}
