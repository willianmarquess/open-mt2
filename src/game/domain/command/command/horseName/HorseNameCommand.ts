import Command from '../../Command';
import HorseNameCommandValidator from './HorseNameCommandValidator';

export default class HorseNameCommand extends Command {
    constructor({ args }: { args: Array<string> }) {
        super({ args, validator: HorseNameCommandValidator });
    }

    static getName() {
        return '/horse_name';
    }

    static getDescription() {
        return 'Rename your horse using 1 Horse Sugar';
    }

    static getExample() {
        return '/horse_name Storm';
    }
}
