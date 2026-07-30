import Command from '../../Command';

export default class DebugCommand extends Command {
    static getName() {
        return '/debug';
    }
    static getDescription() {
        return 'toggle debug messages (regen, damage taken) in your own chat';
    }
}
