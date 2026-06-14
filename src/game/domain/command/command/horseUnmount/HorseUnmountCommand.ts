import Command from '../../Command';
import HorseUnmountCommandValidator from './HorseUnmountCommandValidator';

export default class HorseUnmountCommand extends Command {
    constructor({ args }: { args: Array<string> }) {
        super({ args, validator: HorseUnmountCommandValidator });
    }

    static getName() {
        return '/unmount';
    }

    static getDescription() {
        return 'Unmount button when clicking the horse while mounted.';
    }

    static getExample() {
        return '/unmount';
    }
}
