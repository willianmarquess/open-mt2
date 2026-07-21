import Item from '@/core/domain/entities/game/item/Item';
import Player from '@/core/domain/entities/game/player/Player';
import ItemManager from '@/core/domain/manager/ItemManager';
import MobManager from '@/core/domain/manager/MobManager';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { ItemTypeEnum } from '@/core/enum/ItemTypeEnum';
import { ItemUseSubTypeEnum } from '@/core/enum/ItemUseSubTypeEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { SpecialEffectTypeEnum } from '@/core/enum/SpecialEffectTypeEnum';
import { TimedEventsEnum } from '@/core/enum/TimedEventsEnum';
import { WindowTypeEnum } from '@/core/enum/WindowTypeEnum';
import Logger from '@/core/infra/logger/Logger';

export default class UseItemService {
    private logger: Logger;
    private itemManager: ItemManager;
    private readonly mobManager: MobManager;

    constructor({
        logger,
        itemManager,
        mobManager,
    }: {
        logger: Logger;
        itemManager: ItemManager;
        mobManager: MobManager;
    }) {
        this.logger = logger;
        this.itemManager = itemManager;
        this.mobManager = mobManager;
    }

    async execute(player: Player, window: number, position: number) {
        this.logger.debug(`[UseItemService] using item in window: ${window}, position: ${position}`);

        const item = player.getItem(position);

        if (!item) return;

        if (player.isWearable(item)) {
            await this.useWearableItem(player, item, position, window);
        } else {
            await this.useNonWearableItem(player, item);
        }
    }

    private async useWearableItem(player: Player, item: Item, position: number, window: number) {
        if (player.getInventory().isEquipmentPosition(position)) {
            player.getInventory().removeItem(position, item.getSize());
            const addedPosition = player.getInventory().addItem(item);

            if (addedPosition >= 0) {
                player.sendItemRemoved({
                    window,
                    position,
                });

                player.sendItemAdded({
                    window: WindowTypeEnum.INVENTORY,
                    position: addedPosition,
                    item,
                });

                await this.itemManager.update(item);
            } else {
                player.chat({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: 'Inventory is full',
                });
                player.getInventory().addItemAt(item, position);
            }
        } else {
            const wearPosition = player.getInventory().getWearPosition(item);
            if (!wearPosition) return;

            const itemEquipped = player.getItem(wearPosition);

            if (itemEquipped) {
                player.getInventory().removeItem(position, item.getSize());
                player.getInventory().removeItem(wearPosition, itemEquipped.getSize());

                const addedPosition = player.getInventory().addItem(itemEquipped);

                if (addedPosition >= 0) {
                    player.sendItemRemoved({
                        window: WindowTypeEnum.EQUIPMENT,
                        position: wearPosition,
                    });
                    player.sendItemRemoved({
                        window: WindowTypeEnum.INVENTORY,
                        position,
                    });
                    player.getInventory().addItemAt(item, wearPosition);
                    player.sendItemAdded({
                        window: WindowTypeEnum.EQUIPMENT,
                        position: wearPosition,
                        item,
                    });
                    player.sendItemAdded({
                        window: WindowTypeEnum.INVENTORY,
                        position: addedPosition,
                        item: itemEquipped,
                    });
                    await Promise.all([this.itemManager.update(itemEquipped), this.itemManager.update(item)]);
                } else {
                    player.getInventory().addItemAt(item, position);
                    player.getInventory().addItemAt(itemEquipped, wearPosition);
                    player.chat({
                        messageType: ChatMessageTypeEnum.INFO,
                        message: 'Inventory is full',
                    });
                }
            } else {
                player.getInventory().removeItem(position, item.getSize());
                player.getInventory().addItemAt(item, wearPosition);

                player.sendItemRemoved({
                    window: WindowTypeEnum.INVENTORY,
                    position,
                });
                player.sendItemAdded({
                    window: WindowTypeEnum.EQUIPMENT,
                    position: wearPosition,
                    item,
                });
                await this.itemManager.update(item);
            }
        }
    }

    private async useNonWearableItem(player: Player, item: Item) {
        switch (item.getType()) {
            case ItemTypeEnum.ITEM_USE:
                return this.useItemUsable(player, item);
            case ItemTypeEnum.ITEM_POLYMORPH:
                return this.usePolymorphBall(player, item);
            default:
                break;
        }
    }

    private async useItemUsable(player: Player, item: Item) {
        switch (item.getSubType()) {
            case ItemUseSubTypeEnum.USE_POTION:
                {
                    if (item.getCount() <= 0) {
                        this.logger.debug(
                            `[UseItemService] Item count invalid, this should never happen, playerId: ${player.getId()}, playerName: ${player.getName()}`,
                        );
                        return;
                    }

                    const isMpPotion = item.getValues()[1] > 0;
                    if (isMpPotion) {
                        return await this.useManaPotion(player, item);
                    }
                    const isHpPotion = item.getValues()[0] > 0;
                    if (isHpPotion) {
                        return await this.useHealthPotion(player, item);
                    }
                }
                break;

            case ItemUseSubTypeEnum.USE_SPECIAL:
                return this.useSpecialItem(player, item);

            default:
                this.logger.info(
                    `[UseItemService] unhandled item use - vnum: ${item.getId()}, type: ${item.getType()}, subType: ${item.getSubType()}, player: ${player.getName()}`,
                );
                break;
        }
    }

    private useSpecialItem(player: Player, item: Item) {
        if (item.getId() === 50200) {
            //TODO: add this to an enum avoiding magical numbers
            player.chat({ messageType: ChatMessageTypeEnum.COMMAND, message: 'OpenPrivateShop' });
        }
    }

    private async usePolymorphBall(player: Player, item: Item) {
        if (player.isPolymorphed()) {
            player.chat({ messageType: ChatMessageTypeEnum.INFO, message: 'You are already polymorphed.' });
            return;
        }

        const mobVnum = item.getSocket0();
        if (!mobVnum || !this.mobManager.hasMob(mobVnum)) {
            player.chat({ messageType: ChatMessageTypeEnum.INFO, message: 'Invalid polymorph target.' });
            return;
        }

        const POLYMORPH_DURATION_MS = 300_000; //TODO: read this from config file

        player.setPolymorph(mobVnum);
        await this.removeItemByQuantity(player, item, 1);

        player.addEventTimer({
            id: TimedEventsEnum.POLYMORPH,
            eventFunction: () => {
                player.setPolymorph(0);
            },
            options: {
                interval: POLYMORPH_DURATION_MS,
                duration: POLYMORPH_DURATION_MS,
                repeatCount: 1,
            },
        });
    }

    private async removeItemByQuantity(player: Player, item: Item, quantity: number) {
        if (item.getCount() - quantity <= 0) {
            player.getInventory().removeItem(item.getPosition(), item.getSize());

            player.sendItemRemoved({
                window: WindowTypeEnum.INVENTORY,
                position: item.getPosition(),
            });

            await this.itemManager.delete(item);
            return;
        }

        item.decreaseCount(quantity);
        player.sendItemUpdate(item);
        await this.itemManager.update(item);
    }

    private async useManaPotion(player: Player, item: Item) {
        const hasUsedPotionUntilMaxMana =
            player.getPoint(PointsEnum.MANA_RECOVERY) + player.getPoint(PointsEnum.MANA) >=
            player.getPoint(PointsEnum.MAX_MANA);
        if (hasUsedPotionUntilMaxMana) return;

        const amount = (item.getValues()[1] * Math.min(200, 100 + player.getPoint(PointsEnum.POTION_BONUS))) / 100;
        player.addPoint(PointsEnum.MANA_RECOVERY, amount);
        player.sendSpecialEffect(SpecialEffectTypeEnum.SP_UP_BLUE);

        await this.removeItemByQuantity(player, item, 1);

        if (player.isEventTimerActive(TimedEventsEnum.MANA_POTION)) return;

        player.addEventTimer({
            id: TimedEventsEnum.MANA_POTION,
            eventFunction: () => {
                const manaIsFull = player.getPoint(PointsEnum.MANA) >= player.getPoint(PointsEnum.MAX_MANA);
                if (manaIsFull) return;

                const amount = player.getPoint(PointsEnum.MANA_RECOVERY);

                if (amount <= 0) return;

                player.addPoint(PointsEnum.MANA, amount);
                player.addPoint(PointsEnum.MANA_RECOVERY, -amount);
            },
            options: {
                interval: 1_000,
                duration: 1_000,
            },
        });
    }

    private async useHealthPotion(player: Player, item: Item) {
        const hasUsedPotionUntilMaxMana =
            player.getPoint(PointsEnum.HP_RECOVERY) + player.getPoint(PointsEnum.HEALTH) >=
            player.getPoint(PointsEnum.MAX_HEALTH);
        if (hasUsedPotionUntilMaxMana) return;

        const amount = (item.getValues()[0] * Math.min(200, 100 + player.getPoint(PointsEnum.POTION_BONUS))) / 100;
        player.addPoint(PointsEnum.HP_RECOVERY, amount);
        player.sendSpecialEffect(SpecialEffectTypeEnum.HP_UP_RED);
        await this.removeItemByQuantity(player, item, 1);

        if (player.isEventTimerActive(TimedEventsEnum.HEALTH_POTION)) return;

        player.addEventTimer({
            id: TimedEventsEnum.HEALTH_POTION,
            eventFunction: () => {
                const healthIsFull = player.getPoint(PointsEnum.HEALTH) >= player.getPoint(PointsEnum.MAX_HEALTH);
                if (healthIsFull) return;

                const amount = player.getPoint(PointsEnum.HP_RECOVERY);

                if (amount <= 0) return;

                player.addPoint(PointsEnum.HEALTH, amount);
                player.addPoint(PointsEnum.HP_RECOVERY, -amount);
            },
            options: {
                interval: 1_000,
                duration: 1_000,
            },
        });
    }
}
