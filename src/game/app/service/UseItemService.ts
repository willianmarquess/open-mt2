import Item from '@/core/domain/entities/game/item/Item';
import Player from '@/core/domain/entities/game/player/Player';
import ItemManager from '@/core/domain/manager/ItemManager';
import MobManager from '@/core/domain/manager/MobManager';
import MathUtil from '@/core/domain/util/MathUtil';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { EmpireEnum } from '@/core/enum/EmpireEnum';
import { ItemTypeEnum } from '@/core/enum/ItemTypeEnum';
import { ItemUseSubTypeEnum } from '@/core/enum/ItemUseSubTypeEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { SkillEnum } from '@/core/enum/SkillEnum';
import { SpecialEffectTypeEnum } from '@/core/enum/SpecialEffectTypeEnum';
import { SpecialItemEnum } from '@/core/enum/SpecialItemEnum';
import { TimedEventsEnum } from '@/core/enum/TimedEventsEnum';
import { WindowTypeEnum } from '@/core/enum/WindowTypeEnum';
import Logger from '@/core/infra/logger/Logger';
import { SKILLBOOK_DELAY_MAX, SKILLBOOK_DELAY_MIN } from '@/core/util/Constants';

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
    // SpecialItemEnum.ITEM_HORSE_SKILL_TRAIN_BOOK,
]);

const LEADERSHIP_SKILLBOOK_VNUMS = new Set([
    SpecialItemEnum.SKILL_BOOK_SHUN_ZI,
    SpecialItemEnum.SKILL_BOOK_WU_ZI,
    SpecialItemEnum.SKILL_BOOK_WEILIAO_ZI,
]);

const COMBO_MASTERY_SKILLBOOK_VNUMS = new Set([
    SpecialItemEnum.SKILL_BOOK_COMBO_MASTERY,
    SpecialItemEnum.SKILL_BOOK_COMBO_MASTER,
    SpecialItemEnum.SKILL_BOOK_COMBO_ART,
]);

const LANGUAGE_SKILLBOOK_VNUMS = new Set([
    SpecialItemEnum.SKILL_BOOK_SHINSOO_LANGUAGE,
    SpecialItemEnum.SKILL_BOOK_CHUNJO_LANGUAGE,
    SpecialItemEnum.SKILL_BOOK_JINNO_LANGUAGE,
]);

const SkillLanguageMap: Record<SkillEnum.LANGUAGE1 | SkillEnum.LANGUAGE2 | SkillEnum.LANGUAGE3, EmpireEnum> = {
    [SkillEnum.LANGUAGE1]: EmpireEnum.RED,
    [SkillEnum.LANGUAGE2]: EmpireEnum.YELLOW,
    [SkillEnum.LANGUAGE3]: EmpireEnum.BLUE,
};

const POLYMORPH_SKILLBOOK_VNUMS = new Set([
    SpecialItemEnum.SKILL_BOOK_POLYMORPH,
    SpecialItemEnum.SKILL_BOOK_POLYMORPH_ADVANCED,
    SpecialItemEnum.SKILL_BOOK_POLYMORPH_MASTER,
]);

const MINING_SKILLBOOK_VNUMS = new Set([SpecialItemEnum.SKILL_BOOK_MINING]);

export default class UseItemService {
    private readonly logger: Logger;
    private readonly itemManager: ItemManager;
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

        if (window !== WindowTypeEnum.INVENTORY && window !== WindowTypeEnum.EQUIPMENT) return;

        const item = player.getItem(position);

        if (!item) return;
        if (player.isItemLockedInPrivateShop(item)) return;

        if (player.isWearable(item)) {
            await this.useWearableItem(player, item, position);
        } else {
            const equipFailureReason = player.getEquipFailureReason(item);
            if (equipFailureReason) {
                player.chat({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: equipFailureReason,
                });
                return;
            }

            await this.useNonWearableItem(player, item);
        }
    }

    private async useWearableItem(player: Player, item: Item, position: number) {
        if (player.getInventory().isEquipmentPosition(position)) {
            player.getInventory().removeItem(position, item.getSize());
            const addedPosition = player.getInventory().addItem(item);

            if (addedPosition >= 0) {
                player.sendItemRemoved({
                    window: WindowTypeEnum.EQUIPMENT,
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
            case ItemTypeEnum.ITEM_SPECIAL:
                // Horse feed/revive herbs are ITEM_SPECIAL/SPECIAL_MAP in the
                // item proto, not ITEM_USE/USE_SPECIAL.
                if (ALL_HORSE_ITEM_VNUMS.has(item.getId())) {
                    return this.useHorseItem(player, item);
                }
                break;
            case ItemTypeEnum.ITEM_POLYMORPH:
                return this.usePolymorphBall(player, item);
            case ItemTypeEnum.ITEM_SKILLBOOK:
                return this.useSkillBook(player, item);
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
            return;
        }

        if (ALL_HORSE_ITEM_VNUMS.has(item.getId())) {
            return this.useHorseItem(player, item);
        }

        if (LEADERSHIP_SKILLBOOK_VNUMS.has(item.getId())) {
            return this.useLeadershipBook(player, item);
        }

        if (COMBO_MASTERY_SKILLBOOK_VNUMS.has(item.getId())) {
            return this.useComboBook(player, item);
        }

        if (LANGUAGE_SKILLBOOK_VNUMS.has(item.getId())) {
            return this.useLanguageBook(player, item);
        }

        if (POLYMORPH_SKILLBOOK_VNUMS.has(item.getId())) {
            return this.usePolymorphBook(player, item);
        }

        if (MINING_SKILLBOOK_VNUMS.has(item.getId())) {
            return this.useMiningBook(player, item);
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

    private useHorseSummonBook(player: Player): void {
        if (player.getHorseLevel() <= 0) {
            player.chat({ messageType: ChatMessageTypeEnum.INFO, message: 'You do not own a horse.' });
            return;
        }

        if (player.isHorseRiding()) {
            player.stopRiding();
        } else if (player.getHorseHealth() <= 0) {
            player.summonHorse();
        } else {
            player.startRiding();
        }
    }

    private async useHorseItem(player: Player, item: Item): Promise<void> {
        //TODO: verify if this is used
        // if (item.getId() === SpecialItemEnum.ITEM_HORSE_SKILL_TRAIN_BOOK) {
        //     if (player.learnHorseSkillByBook()) {
        //         await this.removeItemByQuantity(player, item, 1);
        //     }
        //     return;
        // }

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
            await this.removeItemByQuantity(player, item);
        } else if (vnum === feedVnum) {
            if (player.getHorseHealth() <= 0) {
                player.chat({ messageType: ChatMessageTypeEnum.INFO, message: 'You cannot feed a dead horse.' });
                return;
            }
            if (!player.feedHorse()) return;
            player.chat({ messageType: ChatMessageTypeEnum.INFO, message: 'You fed your horse.' });
            await this.removeItemByQuantity(player, item);
        } else {
            // Wrong grade item for this horse
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: 'This item is not suitable for your horse.',
            });
        }
    }

    async removeItemByQuantity(player: Player, item: Item, quantity: number = 1): Promise<boolean> {
        if (quantity <= 0 || item.getCount() < quantity) return false;

        if (item.getCount() <= quantity) {
            player.getInventory().removeItem(item.getPosition(), item.getSize());
            player.sendItemRemoved({
                window: WindowTypeEnum.INVENTORY,
                position: item.getPosition(),
            });
            await this.itemManager.delete(item);
            return true;
        }

        item.decreaseCount(quantity);
        player.sendItemUpdate(item);
        await this.itemManager.update(item);
        return true;
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

    private async useSkillBook(player: Player, item: Item) {
        if (player.isPolymorphed()) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `You can't read while transformed.`,
            });
            return;
        }

        const skillNum: SkillEnum = item.getValues()[0];

        if (skillNum === 0) {
            await this.removeItemByQuantity(player, item, 1);
            return;
        }

        if (player.learnSkillByBook(skillNum)) {
            await this.removeItemByQuantity(player, item, 1);
            const delay = MathUtil.getRandomInt(SKILLBOOK_DELAY_MIN, SKILLBOOK_DELAY_MAX);
            player.setSkillNextReadTime(skillNum, Math.floor(Date.now() / 1000) + delay);
        }
    }

    private async useLeadershipBook(player: Player, item: Item) {
        if (player.isPolymorphed()) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `You can't read while transformed.`,
            });
            return;
        }

        const skillLevel = player.getSkillLevel(SkillEnum.LEADERSHIP);

        if (skillLevel < item.getValues()[0]) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `It isn't easy to understand this book.`,
            });
            return;
        }

        if (skillLevel >= item.getValues()[1]) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `This book will not help you.`,
            });
            return;
        }

        if (player.learnSkillByBook(SkillEnum.LEADERSHIP)) {
            await this.removeItemByQuantity(player, item, 1);
            const delay = MathUtil.getRandomInt(SKILLBOOK_DELAY_MIN, SKILLBOOK_DELAY_MAX);
            player.setSkillNextReadTime(SkillEnum.LEADERSHIP, Math.floor(Date.now() / 1000) + delay);
        }
    }

    private async useComboBook(player: Player, item: Item) {
        if (player.isPolymorphed()) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `You can't read while transformed.`,
            });
            return;
        }

        const skillLevel = player.getSkillLevel(SkillEnum.COMBO);

        if (skillLevel === 0 && player.getPoint(PointsEnum.LEVEL) < 30) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `You need to have a minimum level of 30 to understand this book.`,
            });
            return;
        }

        if (skillLevel === 1 && player.getPoint(PointsEnum.LEVEL) < 50) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `You need to have a minimum level of 50 to understand this book.`,
            });
            return;
        }

        if (skillLevel >= 2) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `This book will not help you.`,
            });
            return;
        }

        const percent = item.getValues()[0];
        if (player.learnSkillByBook(SkillEnum.COMBO, percent)) {
            await this.removeItemByQuantity(player, item, 1);
            const delay = MathUtil.getRandomInt(SKILLBOOK_DELAY_MIN, SKILLBOOK_DELAY_MAX);
            player.setSkillNextReadTime(SkillEnum.COMBO, Math.floor(Date.now() / 1000) + delay);
        }
    }

    private async useLanguageBook(player: Player, item: Item) {
        if (player.isPolymorphed()) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `You can't read while transformed.`,
            });
            return;
        }

        const skillNum = item.getValues()[0] as SkillEnum;
        const percent = MathUtil.minMax(0, item.getValues()[1], 100);
        const skillLevel = player.getSkillLevel(skillNum);

        const isFromEmpire = SkillLanguageMap[skillNum] === player.getEmpire();

        if (skillLevel >= 20 || isFromEmpire) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `You already understand this language.`,
            });
            return;
        }

        if (player.learnSkillByBook(skillNum, percent)) {
            await this.removeItemByQuantity(player, item, 1);
            const delay = MathUtil.getRandomInt(SKILLBOOK_DELAY_MIN, SKILLBOOK_DELAY_MAX);
            player.setSkillNextReadTime(skillNum, Math.floor(Date.now() / 1000) + delay);
        }
    }

    private async usePolymorphBook(player: Player, item: Item) {
        if (player.isPolymorphed()) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `You can't read while transformed.`,
            });
            return;
        }

        const skillLevel = player.getSkillLevel(SkillEnum.POLYMORPH);

        if (skillLevel >= 40) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `You have already mastered this skill.`,
            });
            return;
        }

        if (skillLevel < item.getValues()[0]) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `It isn't easy to understand this book.`,
            });
            return;
        }

        if (skillLevel >= item.getValues()[1]) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `This book will not help you.`,
            });
            return;
        }

        const percent = MathUtil.minMax(0, item.getValues()[2], 100);

        if (player.learnSkillByBook(SkillEnum.POLYMORPH, percent)) {
            await this.removeItemByQuantity(player, item, 1);
            const delay = MathUtil.getRandomInt(SKILLBOOK_DELAY_MIN, SKILLBOOK_DELAY_MAX);
            player.setSkillNextReadTime(SkillEnum.POLYMORPH, Math.floor(Date.now() / 1000) + delay);
        }
    }

    private async useMiningBook(player: Player, item: Item) {
        if (player.isPolymorphed()) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `You can't read while transformed.`,
            });
            return;
        }

        const skillLevel = player.getSkillLevel(SkillEnum.MINING);

        if (skillLevel >= 40) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `You have already mastered this skill.`,
            });
            return;
        }

        const percent = MathUtil.minMax(0, item.getValues()[1], 100);

        if (player.learnSkillByBook(SkillEnum.MINING, percent)) {
            await this.removeItemByQuantity(player, item, 1);
            const delay = MathUtil.getRandomInt(SKILLBOOK_DELAY_MIN, SKILLBOOK_DELAY_MAX);
            player.setSkillNextReadTime(SkillEnum.MINING, Math.floor(Date.now() / 1000) + delay);
        }
    }
}
