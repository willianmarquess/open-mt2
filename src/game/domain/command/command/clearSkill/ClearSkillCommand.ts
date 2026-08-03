import Command from '../../Command';
import ClearSkillCommandValidator from './ClearSkillCommandValidator';

export default class ClearSkillCommand extends Command {
    constructor({ args }: { args: Array<string> }) {
        super({ args, validator: ClearSkillCommandValidator });
    }

    static getName() {
        return '/clearskill';
    }
    static getDescription() {
        return 'clear all of your skills from you or another player';
    }
    static getExample() {
        return '/clearskill [playerName]';
    }
}
