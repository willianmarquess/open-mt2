import CommandHandler from '../../CommandHandler';
import HorseNameCommand from './HorseNameCommand';
import Player from '@/core/domain/entities/game/player/Player';
import Logger from '@/core/infra/logger/Logger';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { WindowTypeEnum } from '@/core/enum/WindowTypeEnum';
import ItemManager from '@/core/domain/manager/ItemManager';

const RENAME_SUGAR_VNUM = 71110;

export default class HorseNameCommandHandler extends CommandHandler<HorseNameCommand> {
    private readonly logger: Logger;
    private readonly itemManager: ItemManager;

    constructor({ logger, itemManager }: { logger: Logger; itemManager: ItemManager }) {
        super();
        this.logger = logger;
        this.itemManager = itemManager;
    }

    async execute(player: Player, command: HorseNameCommand) {
        const name = command.getArgs()[0];

        if (player.getHorseLevel() <= 0) {
            player.chat({ messageType: ChatMessageTypeEnum.INFO, message: 'You do not own a horse!' });
            return;
        }

        // Check rename item
        const sugarItem = [...player.getInventory().getItems().values()].find(
            (item) => item.getId() === RENAME_SUGAR_VNUM,
        );

        if (!sugarItem) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: 'You need Horse Sugar to rename your horse!',
            });
            return;
        }

        const ret = player.setHorseName(name);
        if (ret === 0) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: 'You cannot use this name! It must be between 2 and 12 characters.',
            });
            return;
        } else if (ret === 1) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: 'You cannot use this name! Your horse already has this name.',
            });
            return;
        } else if (ret === 2) {
            // Remove 1 sugar item
            if (sugarItem.getCount() - 1 <= 0) {
                player.getInventory().removeItem(sugarItem.getPosition(), sugarItem.getSize());
                player.sendItemRemoved({
                    window: WindowTypeEnum.INVENTORY,
                    position: sugarItem.getPosition(),
                });
                await this.itemManager.delete(sugarItem);
            } else {
                sugarItem.decreaseCount(1);
                player.sendItemUpdate(sugarItem);
                await this.itemManager.update(sugarItem);
            }

            player.chat({ messageType: ChatMessageTypeEnum.INFO, message: 'Your horse now has a new name!' });
        }
    }
}
