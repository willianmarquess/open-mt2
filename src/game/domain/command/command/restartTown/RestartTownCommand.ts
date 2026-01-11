import Command from '../../Command';

export default class RestartTownCommand extends Command {
    static getName() {
        return '/restart_town';
    }
    static getDescription() {
        return 'Restart at the town';
    }
}
