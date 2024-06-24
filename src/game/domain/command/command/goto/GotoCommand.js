import Command from '../../Command.js';
import GotoCommandValidator from './GotoCommandValidator.js';

export default class GotoCommand extends Command {
    constructor({ args }) {
        super({ args, validator: GotoCommandValidator });
    }

    static get name() {
        return '/goto';
    }
    static get description() {
        return 'teleports you to a <area>, <player> or <location:x,y>';
    }
    static get example() {
        return '/goto <area, player, location> <areaName, targetName, <x, y>>';
    }
}
