import Command from '../../Command';

export default class SelectCommand extends Command {
    static getName() {
        return '/phase_select';
    }
    static getDescription() {
        return 'back to select screen';
    }
}
