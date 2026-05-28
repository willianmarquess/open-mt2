import { ItemProto } from '@/game/infra/config/GameConfig';
import ItemApply from '@/core/domain/entities/game/item/ItemApply';
import ItemLimit from '@/core/domain/entities/game/item/ItemLimit';
import BitFlag from '@/core/util/BitFlag';
import { ItemLimitTypeEnum } from '@/core/enum/ItemLimitTypeEnum';
import { ItemAntiFlagEnum } from '@/core/enum/ItemAntiFlagEnum';
import { ItemFlagEnum } from '@/core/enum/ItemFlagEnum';
import { ItemImmuneFlagEnum } from '@/core/enum/ItemImmuneFlagEnum';
import { ItemWearFlagEnum } from '@/core/enum/ItemWearFlagEnum';
import { ApplyTypeEnum } from '@/core/enum/ApplyTypeEnum';
import ItemState from '../../state/item/ItemState';
import { ItemArmorSubTypeEnum } from '@/core/enum/ItemArmorSubTypeEnum';
import { ItemWeaponSubTypeEnum } from '@/core/enum/ItemWeaponSubTypeEnum';
import { ItemTypeEnum } from '@/core/enum/ItemTypeEnum';
import { ItemAutoUseSubTypeEnum } from '@/core/enum/ItemAutoUseSubTypeEnum';
import { ItemCostumeSubTypeEnum } from '@/core/enum/ItemCostumeSubTypeEnum';
import { ItemLotterySubTypeEnum } from '@/core/enum/ItemLotterySubTypeEnum';
import { ItemFishSubTypeEnum } from '@/core/enum/ItemFishSubTypeEnum';
import { ItemMaterialSubTypeEnum } from '@/core/enum/ItemMaterialSubTypeEnum';
import { ItemResourceSubTypeEnum } from '@/core/enum/ItemResourceSubTypeEnum';
import { ItemSpecialSubTypeEnum } from '@/core/enum/ItemSpecialSubTypeEnum';
import { ItemMetinSubTypeEnum } from '@/core/enum/ItemMetinSubTypeEnum';
import { ItemUseSubTypeEnum } from '@/core/enum/ItemUseSubTypeEnum';
import { ItemExtractSubTypeEnum } from '@/core/enum/ItemExtractSubTypeEnum';
import { ItemToolSubTypeEnum } from '@/core/enum/ItemToolSubTypeEnum';
import { WindowTypeEnum } from '@/core/enum/WindowTypeEnum';

const parseFlags = (flags: string, enumType: any) => {
    const bitFlag = new BitFlag();
    flags
        .split('|')
        .map((flag) => flag.trim())
        .forEach((flag) => {
            if (flag !== 'NONE') bitFlag.set(enumType[flag]);
        });
    return bitFlag;
};

const itemTypeMapper: Record<string, ItemTypeEnum> = {
    ITEM_NONE: ItemTypeEnum.ITEM_NONE,
    ITEM_WEAPON: ItemTypeEnum.ITEM_WEAPON,
    ITEM_ARMOR: ItemTypeEnum.ITEM_ARMOR,
    ITEM_USE: ItemTypeEnum.ITEM_USE,
    ITEM_AUTOUSE: ItemTypeEnum.ITEM_AUTOUSE,
    ITEM_MATERIAL: ItemTypeEnum.ITEM_MATERIAL,
    ITEM_SPECIAL: ItemTypeEnum.ITEM_SPECIAL,
    ITEM_TOOL: ItemTypeEnum.ITEM_TOOL,
    ITEM_LOTTERY: ItemTypeEnum.ITEM_LOTTERY,
    ITEM_ELK: ItemTypeEnum.ITEM_ELK,
    ITEM_METIN: ItemTypeEnum.ITEM_METIN,
    ITEM_CONTAINER: ItemTypeEnum.ITEM_CONTAINER,
    ITEM_FISH: ItemTypeEnum.ITEM_FISH,
    ITEM_ROD: ItemTypeEnum.ITEM_ROD,
    ITEM_RESOURCE: ItemTypeEnum.ITEM_RESOURCE,
    ITEM_CAMPFIRE: ItemTypeEnum.ITEM_CAMPFIRE,
    ITEM_UNIQUE: ItemTypeEnum.ITEM_UNIQUE,
    ITEM_SKILLBOOK: ItemTypeEnum.ITEM_SKILLBOOK,
    ITEM_QUEST: ItemTypeEnum.ITEM_QUEST,
    ITEM_POLYMORPH: ItemTypeEnum.ITEM_POLYMORPH,
    ITEM_TREASURE_BOX: ItemTypeEnum.ITEM_TREASURE_BOX,
    ITEM_TREASURE_KEY: ItemTypeEnum.ITEM_TREASURE_KEY,
    ITEM_SKILLFORGET: ItemTypeEnum.ITEM_SKILLFORGET,
    ITEM_GIFTBOX: ItemTypeEnum.ITEM_GIFTBOX,
    ITEM_PICK: ItemTypeEnum.ITEM_PICK,
    ITEM_HAIR: ItemTypeEnum.ITEM_HAIR,
    ITEM_TOTEM: ItemTypeEnum.ITEM_TOTEM,
    ITEM_BLEND: ItemTypeEnum.ITEM_BLEND,
    ITEM_COSTUME: ItemTypeEnum.ITEM_COSTUME,
    ITEM_DS: ItemTypeEnum.ITEM_DS,
    ITEM_SPECIAL_DS: ItemTypeEnum.ITEM_SPECIAL_DS,
    ITEM_EXTRACT: ItemTypeEnum.ITEM_EXTRACT,
    ITEM_SECONDARY_COIN: ItemTypeEnum.ITEM_SECONDARY_COIN,
    ITEM_RING: ItemTypeEnum.ITEM_RING,
    ITEM_BELT: ItemTypeEnum.ITEM_BELT,
};

const itemLimitMapper: Record<string, ItemLimitTypeEnum> = {
    NONE: ItemLimitTypeEnum.NONE,
    LEVEL: ItemLimitTypeEnum.LEVEL,
};

const applyTypeMapper: Record<string, ApplyTypeEnum> = {
    NONE: ApplyTypeEnum.NONE,
    MAX_HP: ApplyTypeEnum.MAX_HP,
    MAX_SP: ApplyTypeEnum.MAX_SP,
    CON: ApplyTypeEnum.CON,
    INT: ApplyTypeEnum.INT,
    STR: ApplyTypeEnum.STR,
    DEX: ApplyTypeEnum.DEX,
    ATT_SPEED: ApplyTypeEnum.ATT_SPEED,
    MOV_SPEED: ApplyTypeEnum.MOV_SPEED,
    CAST_SPEED: ApplyTypeEnum.CAST_SPEED,
    HP_REGEN: ApplyTypeEnum.HP_REGEN,
    SP_REGEN: ApplyTypeEnum.SP_REGEN,
    POISON_PCT: ApplyTypeEnum.POISON_PCT,
    STUN_PCT: ApplyTypeEnum.STUN_PCT,
    SLOW_PCT: ApplyTypeEnum.SLOW_PCT,
    CRITICAL_PCT: ApplyTypeEnum.CRITICAL_PCT,
    PENETRATE_PCT: ApplyTypeEnum.PENETRATE_PCT,
    ATTBONUS_HUMAN: ApplyTypeEnum.ATTBONUS_HUMAN,
    ATTBONUS_ANIMAL: ApplyTypeEnum.ATTBONUS_ANIMAL,
    ATTBONUS_ORC: ApplyTypeEnum.ATTBONUS_ORC,
    ATTBONUS_MILGYO: ApplyTypeEnum.ATTBONUS_MILGYO,
    ATTBONUS_UNDEAD: ApplyTypeEnum.ATTBONUS_UNDEAD,
    ATTBONUS_DEVIL: ApplyTypeEnum.ATTBONUS_DEVIL,
    STEAL_HP: ApplyTypeEnum.STEAL_HP,
    STEAL_SP: ApplyTypeEnum.STEAL_SP,
    MANA_BURN_PCT: ApplyTypeEnum.MANA_BURN_PCT,
    DAMAGE_SP_RECOVER: ApplyTypeEnum.DAMAGE_SP_RECOVER,
    BLOCK: ApplyTypeEnum.BLOCK,
    DODGE: ApplyTypeEnum.DODGE,
    RESIST_SWORD: ApplyTypeEnum.RESIST_SWORD,
    RESIST_TWOHAND: ApplyTypeEnum.RESIST_TWOHAND,
    RESIST_DAGGER: ApplyTypeEnum.RESIST_DAGGER,
    RESIST_BELL: ApplyTypeEnum.RESIST_BELL,
    RESIST_FAN: ApplyTypeEnum.RESIST_FAN,
    RESIST_BOW: ApplyTypeEnum.RESIST_BOW,
    RESIST_FIRE: ApplyTypeEnum.RESIST_FIRE,
    RESIST_ELEC: ApplyTypeEnum.RESIST_ELEC,
    RESIST_MAGIC: ApplyTypeEnum.RESIST_MAGIC,
    RESIST_WIND: ApplyTypeEnum.RESIST_WIND,
    REFLECT_MELEE: ApplyTypeEnum.REFLECT_MELEE,
    REFLECT_CURSE: ApplyTypeEnum.REFLECT_CURSE,
    POISON_REDUCE: ApplyTypeEnum.POISON_REDUCE,
    KILL_SP_RECOVER: ApplyTypeEnum.KILL_SP_RECOVER,
    EXP_DOUBLE_BONUS: ApplyTypeEnum.EXP_DOUBLE_BONUS,
    GOLD_DOUBLE_BONUS: ApplyTypeEnum.GOLD_DOUBLE_BONUS,
    ITEM_DROP_BONUS: ApplyTypeEnum.ITEM_DROP_BONUS,
    POTION_BONUS: ApplyTypeEnum.POTION_BONUS,
    KILL_HP_RECOVER: ApplyTypeEnum.KILL_HP_RECOVER,
    IMMUNE_STUN: ApplyTypeEnum.IMMUNE_STUN,
    IMMUNE_SLOW: ApplyTypeEnum.IMMUNE_SLOW,
    IMMUNE_FALL: ApplyTypeEnum.IMMUNE_FALL,
    SKILL: ApplyTypeEnum.SKILL,
    BOW_DISTANCE: ApplyTypeEnum.BOW_DISTANCE,
    ATT_GRADE_BONUS: ApplyTypeEnum.ATT_GRADE_BONUS,
    DEF_GRADE_BONUS: ApplyTypeEnum.DEF_GRADE_BONUS,
    MAGIC_ATT_GRADE: ApplyTypeEnum.MAGIC_ATT_GRADE,
    MAGIC_DEF_GRADE: ApplyTypeEnum.MAGIC_DEF_GRADE,
    CURSE_PCT: ApplyTypeEnum.CURSE_PCT,
    MAX_STAMINA: ApplyTypeEnum.MAX_STAMINA,
    ATTBONUS_WARRIOR: ApplyTypeEnum.ATTBONUS_WARRIOR,
    ATTBONUS_ASSASSIN: ApplyTypeEnum.ATTBONUS_ASSASSIN,
    ATTBONUS_SURA: ApplyTypeEnum.ATTBONUS_SURA,
    ATTBONUS_SHAMAN: ApplyTypeEnum.ATTBONUS_SHAMAN,
    ATTBONUS_MONSTER: ApplyTypeEnum.ATTBONUS_MONSTER,
    MALL_ATTBONUS: ApplyTypeEnum.MALL_ATTBONUS,
    MALL_DEFBONUS: ApplyTypeEnum.MALL_DEFBONUS,
    MALL_EXPBONUS: ApplyTypeEnum.MALL_EXPBONUS,
    MALL_ITEMBONUS: ApplyTypeEnum.MALL_ITEMBONUS,
    MALL_GOLDBONUS: ApplyTypeEnum.MALL_GOLDBONUS,
    MAX_HP_PCT: ApplyTypeEnum.MAX_HP_PCT,
    MAX_SP_PCT: ApplyTypeEnum.MAX_SP_PCT,
    SKILL_DAMAGE_BONUS: ApplyTypeEnum.SKILL_DAMAGE_BONUS,
    NORMAL_HIT_DAMAGE_BONUS: ApplyTypeEnum.NORMAL_HIT_DAMAGE_BONUS,
    SKILL_DEFEND_BONUS: ApplyTypeEnum.SKILL_DEFEND_BONUS,
    NORMAL_HIT_DEFEND_BONUS: ApplyTypeEnum.NORMAL_HIT_DEFEND_BONUS,
    PC_BANG_EXP_BONUS: ApplyTypeEnum.PC_BANG_EXP_BONUS,
    PC_BANG_DROP_BONUS: ApplyTypeEnum.PC_BANG_DROP_BONUS,
    EXTRACT_HP_PCT: ApplyTypeEnum.EXTRACT_HP_PCT,
    RESIST_WARRIOR: ApplyTypeEnum.RESIST_WARRIOR,
    RESIST_ASSASSIN: ApplyTypeEnum.RESIST_ASSASSIN,
    RESIST_SURA: ApplyTypeEnum.RESIST_SURA,
    RESIST_SHAMAN: ApplyTypeEnum.RESIST_SHAMAN,
    ENERGY: ApplyTypeEnum.ENERGY,
    DEF_GRADE: ApplyTypeEnum.DEF_GRADE,
    COSTUME_ATTR_BONUS: ApplyTypeEnum.COSTUME_ATTR_BONUS,
    MAGIC_ATTBONUS_PER: ApplyTypeEnum.MAGIC_ATTBONUS_PER,
    MELEE_MAGIC_ATTBONUS_PER: ApplyTypeEnum.MELEE_MAGIC_ATTBONUS_PER,
    RESIST_ICE: ApplyTypeEnum.RESIST_ICE,
    RESIST_EARTH: ApplyTypeEnum.RESIST_EARTH,
    RESIST_DARK: ApplyTypeEnum.RESIST_DARK,
    ANTI_CRITICAL_PCT: ApplyTypeEnum.ANTI_CRITICAL_PCT,
    ANTI_PENETRATE_PCT: ApplyTypeEnum.ANTI_PENETRATE_PCT,
};

const itemTypeSubTypeMapper: Record<any, any> = {
    [ItemTypeEnum.ITEM_ARMOR]: ItemArmorSubTypeEnum,
    [ItemTypeEnum.ITEM_WEAPON]: ItemWeaponSubTypeEnum,
    [ItemTypeEnum.ITEM_AUTOUSE]: ItemAutoUseSubTypeEnum,
    [ItemTypeEnum.ITEM_COSTUME]: ItemCostumeSubTypeEnum,
    [ItemTypeEnum.ITEM_LOTTERY]: ItemLotterySubTypeEnum,
    [ItemTypeEnum.ITEM_FISH]: ItemFishSubTypeEnum,
    [ItemTypeEnum.ITEM_MATERIAL]: ItemMaterialSubTypeEnum,
    [ItemTypeEnum.ITEM_RESOURCE]: ItemResourceSubTypeEnum,
    [ItemTypeEnum.ITEM_SPECIAL]: ItemSpecialSubTypeEnum,
    [ItemTypeEnum.ITEM_METIN]: ItemMetinSubTypeEnum,
    [ItemTypeEnum.ITEM_USE]: ItemUseSubTypeEnum,
    [ItemTypeEnum.ITEM_EXTRACT]: ItemExtractSubTypeEnum,
    [ItemTypeEnum.ITEM_TOOL]: ItemToolSubTypeEnum,
};

type ItemParams = {
    id: number;
    name: string;
    type: ItemTypeEnum;
    subType: number;
    size: number;
    antiFlags: BitFlag;
    flags: BitFlag;
    wearFlags: BitFlag;
    immuneFlags: BitFlag;
    gold: number;
    shopPrice: number;
    refineId: number;
    refineSet: number;
    magicPercent: number;
    limits: Array<ItemLimit>;
    applies: Array<ItemApply>;
    values: Array<number>;
    specular: number;
    socket: number;
    addon: number;
    count: number;
    socket0: number;
    socket1: number;
    socket2: number;
    attributeType0: number;
    attributeValue0: number;
    attributeType1: number;
    attributeValue1: number;
    attributeType2: number;
    attributeValue2: number;
    attributeType3: number;
    attributeValue3: number;
    attributeType4: number;
    attributeValue4: number;
    attributeType5: number;
    attributeValue5: number;
    attributeType6: number;
    attributeValue6: number;
    dbId?: number | null;
};

export default class Item {
    private readonly id: number;
    private readonly name: string;
    private readonly type: ItemTypeEnum;
    private readonly subType: number;
    private readonly size: number;
    private readonly antiFlags: BitFlag;
    private readonly flags: BitFlag;
    private readonly wearFlags: BitFlag;
    private readonly immuneFlags: BitFlag;
    private readonly gold: number;
    private readonly shopPrice: number;
    private readonly refineId: number;
    private readonly refineSet: number;
    private readonly magicPercent: number;
    private readonly limits: Array<ItemLimit> = [];
    private readonly applies: Array<ItemApply> = [];
    private readonly values: Array<number> = [];
    private readonly specular: number;
    private readonly socket: number;
    private readonly addon: number;
    private count: number;

    private dbId: number | null = null;
    private ownerId: number | null = null;
    private position: number | null = null;
    private window: WindowTypeEnum = WindowTypeEnum.INVENTORY;
    private socket0: number;
    private socket1: number;
    private socket2: number;
    private attributeType0: number;
    private attributeValue0: number;
    private attributeType1: number;
    private attributeValue1: number;
    private attributeType2: number;
    private attributeValue2: number;
    private attributeType3: number;
    private attributeValue3: number;
    private attributeType4: number;
    private attributeValue4: number;
    private attributeType5: number;
    private attributeValue5: number;
    private attributeType6: number;
    private attributeValue6: number;
    private protoId: number;

    constructor({
        id,
        name,
        type,
        subType,
        size,
        antiFlags,
        flags,
        wearFlags,
        immuneFlags,
        gold,
        shopPrice,
        refineId,
        refineSet,
        magicPercent,
        limits,
        applies,
        values,
        specular,
        socket,
        addon,
        count = 1,
        socket0 = 0,
        socket1 = 0,
        socket2 = 0,
        attributeType0 = 0,
        attributeValue0 = 0,
        attributeType1 = 0,
        attributeValue1 = 0,
        attributeType2 = 0,
        attributeValue2 = 0,
        attributeType3 = 0,
        attributeValue3 = 0,
        attributeType4 = 0,
        attributeValue4 = 0,
        attributeType5 = 0,
        attributeValue5 = 0,
        attributeType6 = 0,
        attributeValue6 = 0,
        dbId = null,
    }: ItemParams) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.subType = subType;
        this.size = size;
        this.antiFlags = antiFlags;
        this.flags = flags;
        this.wearFlags = wearFlags;
        this.immuneFlags = immuneFlags;
        this.gold = gold;
        this.shopPrice = shopPrice;
        this.refineId = refineId;
        this.refineSet = refineSet;
        this.magicPercent = magicPercent;
        this.limits = limits;
        this.applies = applies;
        this.values = values;
        this.specular = specular;
        this.socket = socket;
        this.addon = addon;
        this.count = count;
        this.socket0 = socket0;
        this.socket1 = socket1;
        this.socket2 = socket2;
        this.attributeType0 = attributeType0;
        this.attributeValue0 = attributeValue0;
        this.attributeType1 = attributeType1;
        this.attributeValue1 = attributeValue1;
        this.attributeType2 = attributeType2;
        this.attributeValue2 = attributeValue2;
        this.attributeType3 = attributeType3;
        this.attributeValue3 = attributeValue3;
        this.attributeType4 = attributeType4;
        this.attributeValue4 = attributeValue4;
        this.attributeType5 = attributeType5;
        this.attributeValue5 = attributeValue5;
        this.attributeType6 = attributeType6;
        this.attributeValue6 = attributeValue6;
        this.dbId = dbId;
        this.protoId = id;
    }

    getId() {
        return this.id;
    }
    getName() {
        return this.name;
    }
    getType() {
        return this.type;
    }
    getSubType() {
        return this.subType;
    }
    getSize() {
        return this.size;
    }
    getAntiFlags() {
        return this.antiFlags;
    }
    getFlags() {
        return this.flags;
    }
    getWearFlags() {
        return this.wearFlags;
    }
    getImmuneFlags() {
        return this.immuneFlags;
    }
    getGold() {
        return this.gold;
    }
    getShopPrice() {
        return this.shopPrice;
    }
    getRefineId() {
        return this.refineId;
    }
    getRefineSet() {
        return this.refineSet;
    }
    getMagicPercent() {
        return this.magicPercent;
    }
    getLimits() {
        return this.limits;
    }
    getApplies() {
        return this.applies;
    }
    getValues() {
        return this.values;
    }
    getSpecular() {
        return this.specular;
    }
    getSocket() {
        return this.socket;
    }
    getAddon() {
        return this.addon;
    }
    getCount() {
        return this.count;
    }
    setCount(value: number) {
        this.count = value;
    }
    getOwnerId() {
        return this.ownerId;
    }
    setOwnerId(value: number) {
        this.ownerId = value;
    }
    getPosition() {
        return this.position!;
    }
    setPosition(value: number | null) {
        this.position = value;
    }
    getDbId() {
        return this.dbId;
    }
    getSocket0() {
        return this.socket0;
    }
    getSocket1() {
        return this.socket1;
    }
    getSocket2() {
        return this.socket2;
    }
    getAttributeType0() {
        return this.attributeType0;
    }
    getAttributeValue0() {
        return this.attributeValue0;
    }
    getAttributeType1() {
        return this.attributeType1;
    }
    getAttributeValue1() {
        return this.attributeValue1;
    }
    getAttributeType2() {
        return this.attributeType2;
    }
    getAttributeValue2() {
        return this.attributeValue2;
    }
    getAttributeType3() {
        return this.attributeType3;
    }
    getAttributeValue3() {
        return this.attributeValue3;
    }
    getAttributeType4() {
        return this.attributeType4;
    }
    getAttributeValue4() {
        return this.attributeValue4;
    }
    getAttributeType5() {
        return this.attributeType5;
    }
    getAttributeValue5() {
        return this.attributeValue5;
    }
    getAttributeType6() {
        return this.attributeType6;
    }
    getAttributeValue6() {
        return this.attributeValue6;
    }
    getWindow() {
        return this.window;
    }
    setDbId(value: number) {
        this.dbId = value;
    }
    setSocket0(value: number) {
        this.socket0 = value;
    }
    setSocket1(value: number) {
        this.socket1 = value;
    }
    setSocket2(value: number) {
        this.socket2 = value;
    }
    setAttributeType0(value: number) {
        this.attributeType0 = value;
    }
    setAttributeType1(value: number) {
        this.attributeType1 = value;
    }
    setAttributeType2(value: number) {
        this.attributeType2 = value;
    }
    setAttributeType3(value: number) {
        this.attributeType3 = value;
    }
    setAttributeType4(value: number) {
        this.attributeType4 = value;
    }
    setAttributeValue5(value: number) {
        this.attributeValue5 = value;
    }
    setAttributeType6(value: number) {
        this.attributeType6 = value;
    }
    setWindow(value: number) {
        this.window = value;
    }

    getLevelLimit() {
        return this.limits.find((limit) => limit.type === ItemLimitTypeEnum.LEVEL)?.value ?? 0;
    }

    increaseCount(quantity: number) {
        this.count += quantity;
    }

    decreaseCount(quantity: number) {
        this.count -= quantity;
    }

    static create(proto: ItemProto, count: number) {
        const antiFlagsBitFlag = parseFlags(proto.anti_flag, ItemAntiFlagEnum);
        const flagsBitFlag = parseFlags(proto.flag, ItemFlagEnum);
        const immuneFlagsBitFlag = parseFlags(proto.immune, ItemImmuneFlagEnum);
        const wearFlagsBitFlag = parseFlags(proto.item_wear, ItemWearFlagEnum);
        const itemType: ItemTypeEnum = itemTypeMapper[proto.item_type] || ItemTypeEnum.ITEM_NONE;
        const itemSubTypeEnum = itemTypeSubTypeMapper[itemType];
        const itemSubType = itemSubTypeEnum && itemSubTypeEnum[proto.sub_type] ? itemSubTypeEnum[proto.sub_type] : 0;

        return new Item({
            id: Number(proto.vnum),
            name: proto.name,
            type: itemType,
            gold: Number(proto.gold),
            shopPrice: Number(proto.shop_buy_price),
            refineId: Number(proto.refine),
            refineSet: Number(proto.refineset),
            magicPercent: Number(proto.magic_pct),
            subType: itemSubType,
            size: Number(proto.size),
            addon: Number(proto.attu_addon),
            socket: Number(proto.socket),
            specular: Number(proto.specular),
            antiFlags: antiFlagsBitFlag,
            flags: flagsBitFlag,
            immuneFlags: immuneFlagsBitFlag,
            wearFlags: wearFlagsBitFlag,
            limits: [
                new ItemLimit({
                    type: itemLimitMapper[`${proto.limit_type0.split('LIMIT_')[1]}`] || ItemLimitTypeEnum.NONE,
                    value: Number(proto.limit_value0),
                }),
                new ItemLimit({
                    type: itemLimitMapper[`${proto.limit_type1.split('LIMIT_')[1]}`] || ItemLimitTypeEnum.NONE,
                    value: Number(proto.limit_value1),
                }),
            ],
            applies: [
                new ItemApply({
                    type: applyTypeMapper[`${proto.addon_type0.split('APPLY_')[1]}`] || ApplyTypeEnum.NONE,
                    value: Number(proto.addon_value0),
                }),
                new ItemApply({
                    type: applyTypeMapper[`${proto.addon_type1.split('APPLY_')[1]}`] || ApplyTypeEnum.NONE,
                    value: Number(proto.addon_value1),
                }),
                new ItemApply({
                    type: applyTypeMapper[`${proto.addon_type2.split('APPLY_')[1]}`] || ApplyTypeEnum.NONE,
                    value: Number(proto.addon_value2),
                }),
            ],
            values: [
                Number(proto.value0),
                Number(proto.value1),
                Number(proto.value2),
                Number(proto.value3),
                Number(proto.value4),
                Number(proto.value5),
            ],
            count: flagsBitFlag.is(ItemFlagEnum.ITEM_STACKABLE) ? count : 1,
            attributeType0: 0,
            attributeValue0: 0,
            attributeType1: 0,
            attributeValue1: 0,
            attributeType2: 0,
            attributeValue2: 0,
            attributeType3: 0,
            attributeValue3: 0,
            attributeType4: 0,
            attributeValue4: 0,
            attributeType5: 0,
            attributeValue5: 0,
            attributeType6: 0,
            attributeValue6: 0,
            socket0: 0,
            socket1: 0,
            socket2: 0,
        });
    }

    static fromDatabase({
        id,
        ownerId,
        window,
        position,
        count,
        protoId,
        socket0,
        socket1,
        socket2,
        attributeType0,
        attributeValue0,
        attributeType1,
        attributeValue1,
        attributeType2,
        attributeValue2,
        attributeType3,
        attributeValue3,
        attributeType4,
        attributeValue4,
        attributeType5,
        attributeValue5,
        attributeType6,
        attributeValue6,
        proto,
    }: {
        id: number;
        ownerId: number;
        window: WindowTypeEnum;
        position: number;
        count: number;
        protoId: number;
        socket0: number;
        socket1: number;
        socket2: number;
        attributeType0: number;
        attributeValue0: number;
        attributeType1: number;
        attributeValue1: number;
        attributeType2: number;
        attributeValue2: number;
        attributeType3: number;
        attributeValue3: number;
        attributeType4: number;
        attributeValue4: number;
        attributeType5: number;
        attributeValue5: number;
        attributeType6: number;
        attributeValue6: number;
        proto: ItemProto;
    }) {
        const item = this.create(proto, count);
        item.dbId = id;
        item.ownerId = ownerId;
        item.window = window;
        item.position = position;
        item.protoId = protoId;
        item.socket0 = socket0;
        item.socket1 = socket1;
        item.socket2 = socket2;
        item.attributeType0 = attributeType0;
        item.attributeValue0 = attributeValue0;
        item.attributeType1 = attributeType1;
        item.attributeValue1 = attributeValue1;
        item.attributeType2 = attributeType2;
        item.attributeValue2 = attributeValue2;
        item.attributeType3 = attributeType3;
        item.attributeValue3 = attributeValue3;
        item.attributeType4 = attributeType4;
        item.attributeValue4 = attributeValue4;
        item.attributeType5 = attributeType5;
        item.attributeValue5 = attributeValue5;
        item.attributeType6 = attributeType6;
        item.attributeValue6 = attributeValue6;
        return item;
    }

    toDatabase() {
        return new ItemState({
            id: this.dbId!,
            ownerId: this.ownerId!,
            window: this.window,
            position: this.position!,
            count: this.count,
            protoId: this.id,
            socket0: this.socket0,
            socket1: this.socket1,
            socket2: this.socket2,
            attributeType0: this.attributeType0,
            attributeValue0: this.attributeValue0,
            attributeType1: this.attributeType1,
            attributeValue1: this.attributeValue1,
            attributeType2: this.attributeType2,
            attributeValue2: this.attributeValue2,
            attributeType3: this.attributeType3,
            attributeValue3: this.attributeValue3,
            attributeType4: this.attributeType4,
            attributeValue4: this.attributeValue4,
            attributeType5: this.attributeType5,
            attributeValue5: this.attributeValue5,
            attributeType6: this.attributeType6,
            attributeValue6: this.attributeValue6,
        });
    }
}
