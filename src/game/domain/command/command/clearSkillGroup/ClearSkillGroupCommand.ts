import Command from '../../Command';
import ClearSkillGroupCommandValidator from './ClearSkillGroupCommandValidator';

export default class ClearSkillGroupCommand extends Command {
    constructor({ args }: { args: Array<string> }) {
        super({ args, validator: ClearSkillGroupCommandValidator });
    }

    static getName() {
        return '/clearskillgroup';
    }
    static getDescription() {
        return 'clear skill group from you or another player';
    }
    static getExample() {
        return '/clearskillgroup [playerName]';
    }
}
