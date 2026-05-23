import Command from '../../Command';
import PolymorphCommandValidator from './PolymorphCommandValidator';

export default class PolymorphCommand extends Command {
    constructor({ args }: { args: Array<string> }) {
        super({ args, validator: PolymorphCommandValidator });
    }

    static getName() {
        return '/polymorph';
    }

    static getDescription() {
        return 'Transform into a mob by vnum. Pass 0 to revert.';
    }

    static getExample() {
        return '/polymorph <vnum>';
    }
}
