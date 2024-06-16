import Command from '../../Command.js';

export default class QuitCommand extends Command {
    static get name() {
        return '/quit';
    }
    static get description() {
        return 'quit the client';
    }
}
