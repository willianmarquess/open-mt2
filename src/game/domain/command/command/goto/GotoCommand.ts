import Command from '../../Command';
import GotoCommandValidator from './GotoCommandValidator';

export default class GotoCommand extends Command {
    constructor({ args }) {
        super({ args, validator: GotoCommandValidator });
    }

    static getName() {
        return '/goto';
    }
    static getDescription() {
        return 'teleports you to a <area>, <player> or <location:x,y>';
    }
    static getExample() {
        return '/goto <area, player, location> <areaName, targetName, <x, y>>';
    }
}
