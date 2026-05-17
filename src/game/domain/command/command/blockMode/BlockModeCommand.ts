import Command from '../../Command';
import BlockModeCommandValidator from './BlockModeCommandValidator';

export default class BlockModeCommand extends Command {
    constructor({ args }: { args: Array<string> }) {
        super({ args, validator: BlockModeCommandValidator });
    }

    static getName() {
        return '/setblockmode';
    }
    static getDescription() {
        return 'set player interaction block modes';
    }
    static getExample() {
        return '/setblockmode <number>';
    }
}
