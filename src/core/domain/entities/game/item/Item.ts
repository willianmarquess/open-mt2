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

type ItemParams = {
    id?: number,
    name?: string,
    type?: string,
    subType?: string,
    size?: number,
    antiFlags?: BitFlag,
    flags?: BitFlag,
    wearFlags?: BitFlag,
    immuneFlags?: BitFlag,
    gold?: number,
    shopPrice?: number,
    refineId?: number,
    refineSet?: number,
    magicPercent?: number,
    limits?: Array<ItemLimit>,
    applies?: Array<ItemApply>,
    values?: Array<number>,
    specular?: number,
    socket?: number,
    addon?: number,
    count?: number,
    socket0?: number,
    socket1?: number,
    socket2?: number,
    attributeType0?: number,
    attributeValue0?: number,
    attributeType1?: number,
    attributeValue1?: number,
    attributeType2?: number,
    attributeValue2?: number,
    attributeType3?: number,
    attributeValue3?: number,
    attributeType4?: number,
    attributeValue4?: number,
    attributeType5?: number,
    attributeValue5?: number,
    attributeType6?: number,
    attributeValue6?: number,
    dbId?: number,
}

export default class Item {
    private id: number;
    private name: string;
    private type: string;
    private subType: string;
    private size: number;
    private antiFlags: BitFlag;
    private flags: BitFlag;
    private wearFlags: BitFlag;
    private immuneFlags: BitFlag;
    private gold: number;
    private shopPrice: number;
    private refineId: number;
    private refineSet: number;
    private magicPercent: number;
    private limits: Array<ItemLimit> = [];
    private applies: Array<ItemApply> = [];
    private values: Array<number> = [];
    private specular: number;
    private socket: number;
    private addon: number;
    private count: number;

    private dbId: number;
    private ownerId: number;
    private position: number;
    private window: number;
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
        dbId,
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
    }

    getId() {
        return this.id;
    }
    getName() {
        return this.name;
    }
    geType() {
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
    setOwnerId(value) {
        this.ownerId = value;
    }
    getPosition() {
        return this.position;
    }
    setPosition(value) {
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
    setDbId(value) {
        this.dbId = value;
    }
    setSocket0(value) {
        this.socket0 = value;
    }
    setSocket1(value) {
        this.socket1 = value;
    }
    setSocket2(value) {
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

    static create(proto: ItemProto, count: number) {
        const antiFlagsBitFlag = parseFlags(proto.anti_flag, ItemAntiFlagEnum);
        const flagsBitFlag = parseFlags(proto.flag, ItemFlagEnum);
        const immuneFlagsBitFlag = parseFlags(proto.immune, ItemImmuneFlagEnum);
        const wearFlagsBitFlag = parseFlags(proto.item_wear, ItemWearFlagEnum);

        return new Item({
            id: Number(proto.vnum),
            name: proto.name,
            type: proto.item_type,
            gold: Number(proto.gold),
            shopPrice: Number(proto.shop_buy_price),
            refineId: Number(proto.refine),
            refineSet: Number(proto.refineset),
            magicPercent: Number(proto.magic_pct),
            subType: proto.sub_type,
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
                    type: ItemLimitTypeEnum[proto.limit_type0] || ItemLimitTypeEnum.LIMIT_NONE,
                    value: proto.limit_value0,
                }),
                new ItemLimit({
                    type: ItemLimitTypeEnum[proto.limit_type1] || ItemLimitTypeEnum.LIMIT_NONE,
                    value: proto.limit_value1,
                }),
            ],
            applies: [
                new ItemApply({
                    type: ApplyTypeEnum[proto.addon_type0] || ApplyTypeEnum.APPLY_NONE,
                    value: proto.addon_value0,
                }),
                new ItemApply({
                    type: ApplyTypeEnum[proto.addon_type1] || ApplyTypeEnum.APPLY_NONE,
                    value: proto.addon_value1,
                }),
                new ItemApply({
                    type: ApplyTypeEnum[proto.addon_type2] || ApplyTypeEnum.APPLY_NONE,
                    value: proto.addon_value2,
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
        return {
            id: this.dbId,
            ownerId: this.ownerId,
            window: this.window,
            position: this.position,
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
        };
    }
}
