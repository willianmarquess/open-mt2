import Item from '@/core/domain/entities/game/item/Item';
import Player from '@/core/domain/entities/game/player/Player';
import ItemManager from '@/core/domain/manager/ItemManager';
import MobManager from '@/core/domain/manager/MobManager';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { ItemTypeEnum } from '@/core/enum/ItemTypeEnum';
import { ItemUseSubTypeEnum } from '@/core/enum/ItemUseSubTypeEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { SpecialEffectTypeEnum } from '@/core/enum/SpecialEffectTypeEnum';
import { WindowTypeEnum } from '@/core/enum/WindowTypeEnum';
import Logger from '@/core/infra/logger/Logger';

// Horse item vnums from unique_item.h
// Feed items restore 1 HP to a living horse.
// Revive items restore a dead horse to full health/stamina.
// Grade matching: grade 1 horse (lvl 1-10) uses _1 items, etc.
const ITEM_HORSE_FOOD_1 = 50054;
const ITEM_HORSE_FOOD_2 = 50055;
const ITEM_HORSE_FOOD_3 = 50056;
const ITEM_REVIVE_HORSE_1 = 50057;
const ITEM_REVIVE_HORSE_2 = 50058;
const ITEM_REVIVE_HORSE_3 = 50059;

// Horse summoning books (ITEM_QUEST type, vnums 50051-50053).
// Using a book grants the player a horse of that grade (sets horseLevel to 1/11/21).
export const ITEM_HORSE_SUMMON_BOOK_1 = 50051; // grade 1 – beginner  horse (level 1)
const ITEM_HORSE_SUMMON_BOOK_2 = 50052; // grade 2 – intermediate horse (level 11)
const ITEM_HORSE_SUMMON_BOOK_3 = 50053; // grade 3 – advanced horse (level 21)

const HORSE_SUMMON_BOOK_VNUMS = new Set([ITEM_HORSE_SUMMON_BOOK_1, ITEM_HORSE_SUMMON_BOOK_2, ITEM_HORSE_SUMMON_BOOK_3]);

const HORSE_FEED_BY_GRADE: Record<number, number> = {
    1: ITEM_HORSE_FOOD_1,
    2: ITEM_HORSE_FOOD_2,
    3: ITEM_HORSE_FOOD_3,
};

const HORSE_REVIVE_BY_GRADE: Record<number, number> = {
    1: ITEM_REVIVE_HORSE_1,
    2: ITEM_REVIVE_HORSE_2,
    3: ITEM_REVIVE_HORSE_3,
};

const ALL_HORSE_ITEM_VNUMS = new Set([
    ITEM_HORSE_FOOD_1,
    ITEM_HORSE_FOOD_2,
    ITEM_HORSE_FOOD_3,
    ITEM_REVIVE_HORSE_1,
    ITEM_REVIVE_HORSE_2,
    ITEM_REVIVE_HORSE_3,
]);

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
            case ItemTypeEnum.ITEM_QUEST:
                if (HORSE_SUMMON_BOOK_VNUMS.has(item.getId())) {
                    return this.useHorseSummonBook(player);
                }
                break;
            default:
                break;
        }
    }

    private async useItemUsable(player: Player, item: Item) {
        switch (item.getSubType()) {
            case ItemUseSubTypeEnum.USE_SPECIAL:
                return this.useSpecialItem(player, item);
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

            case ItemUseSubTypeEnum.USE_POLYMORPH_BALL:
                return await this.usePolymorphBall(player, item);

            default:
                this.logger.info(
                    `[UseItemService] unhandled item use - vnum: ${item.getId()}, type: ${item.getType()}, subType: ${item.getSubType()}, player: ${player.getName()}`,
                );
                break;
        }
    }

    private useSpecialItem(player: Player, item: Item) {
        if (item.getId() === 50200) {
            // The client opens the private shop UI when it receives a CHAT_TYPE_COMMAND
            // packet with the string "OpenPrivateShop"
            player.chat({ messageType: ChatMessageTypeEnum.COMMAND, message: 'OpenPrivateShop' });
            return;
        }

        if (ALL_HORSE_ITEM_VNUMS.has(item.getId())) {
            return this.useHorseItem(player, item);
        }
    }

    private async usePolymorphBall(player: Player, item: Item) {
        if (player.isPolymorphed()) {
            player.chat({ messageType: ChatMessageTypeEnum.INFO, message: 'You are already polymorphed.' });
            return;
        }

        // Socket 0 holds the mob vnum (as stored by the polymorph ball item)
        const mobVnum = item.getSocket0();
        if (!mobVnum || !this.mobManager.hasMob(mobVnum)) {
            player.chat({ messageType: ChatMessageTypeEnum.INFO, message: 'Invalid polymorph target.' });
            return;
        }

        // Fixed duration: 5 minutes (300 seconds) — skill-level scaling can be added later
        const POLYMORPH_DURATION_MS = 300_000;

        player.setPolymorph(mobVnum);
        await this.removeItemByQuantity(player, item, 1);

        // Schedule automatic revert
        player.addEventTimer({
            id: 'POLYMORPH',
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

    private useHorseSummonBook(player: Player): void {
        if (player.getHorseLevel() <= 0) {
            player.chat({ messageType: ChatMessageTypeEnum.INFO, message: 'You do not own a horse.' });
            return;
        }

        if (player.isHorseRiding()) {
            player.stopRiding();
        } else {
            player.startRiding();
        }
        // Item is not consumed - it is a reusable summoning book.
    }

    private useHorseItem(player: Player, item: Item): void {
        const grade = player.getHorseGrade();

        if (grade <= 0) {
            player.chat({ messageType: ChatMessageTypeEnum.INFO, message: 'You do not own a horse.' });
            return;
        }

        const vnum = item.getId();
        const feedVnum = HORSE_FEED_BY_GRADE[grade];
        const reviveVnum = HORSE_REVIVE_BY_GRADE[grade];

        if (vnum === reviveVnum) {
            if (player.getHorseHealth() > 0) {
                player.chat({ messageType: ChatMessageTypeEnum.INFO, message: 'Your horse is not dead.' });
                return;
            }
            player.reviveHorse();
            player.chat({ messageType: ChatMessageTypeEnum.INFO, message: 'You revived your horse.' });
            item.decreaseCount(1);
        } else if (vnum === feedVnum) {
            if (player.getHorseHealth() <= 0) {
                player.chat({ messageType: ChatMessageTypeEnum.INFO, message: 'You cannot feed a dead horse.' });
                return;
            }
            player.feedHorse();
            player.chat({ messageType: ChatMessageTypeEnum.INFO, message: 'You fed your horse.' });
            item.decreaseCount(1);
        } else {
            // Wrong grade item for this horse
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: 'This item is not suitable for your horse.',
            });
        }
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

        if (player.isEventTimerActive('MANA_POTION')) return;

        player.addEventTimer({
            id: 'MANA_POTION',
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

        if (player.isEventTimerActive('HEALTH_POTION')) return;

        player.addEventTimer({
            id: 'HEALTH_POTION',
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
