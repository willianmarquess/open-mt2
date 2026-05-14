import Command from '../../Command';

export default class CloseShopCommand extends Command {
    static getName() {
        return '/close_shop';
    }
    static getDescription() {
        return 'Close the player private shop';
    }
}
