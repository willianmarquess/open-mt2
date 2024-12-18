import Command from '../../Command';

export default class QuitCommand extends Command {
    static getName() {
        return '/quit';
    }
    static getDescription() {
        return 'quit the client';
    }
}
