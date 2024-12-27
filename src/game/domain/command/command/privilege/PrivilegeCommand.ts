import Command from '../../Command';
import PrivilegeCommandValidator from './PrivilegeCommandValidator';

export default class PrivilegeCommand extends Command {
    constructor({ args }) {
        super({ args, validator: PrivilegeCommandValidator });
    }

    static getName() {
        return '/priv';
    }
    static getDescription() {
        return 'add privilege to a empire, player or guild';
    }
    static getExample() {
        return '/priv <player, empire, guild> <playerName, empireName, guildName> <gold, drop, gold5, gold10, gold50> <value> <timeInSeconds>';
    }
}
