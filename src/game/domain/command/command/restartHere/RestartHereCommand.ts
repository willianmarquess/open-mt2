import Command from '../../Command';

export default class RestartHereCommand extends Command {
    static getName() {
        return '/restart_here';
    }
    static getDescription() {
        return 'Restart at same coordinates';
    }
}
