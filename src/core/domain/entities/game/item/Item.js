import ApplyTypeEnum from '../../../../enum/ApplyTypeEnum.js';
import ItemAntiFlagEnum from '../../../../enum/ItemAntiFlagEnum.js';
import ItemFlagEnum from '../../../../enum/ItemFlagEnum.js';
import ItemImmuneFlagEnum from '../../../../enum/ItemImmuneFlagEnum.js';
import ItemLimitTypeEnum from '../../../../enum/ItemLimitTypeEnum.js';
import ItemWearFlagEnum from '../../../../enum/ItemWearFlagEnum.js';
import BitFlag from '../../../../util/BitFlag.js';
import ItemApply from './ItemApply.js';
import ItemLimit from './ItemLimit.js';

const parseFlags = (flags, enumType) => {
    const bitFlag = new BitFlag();
    flags
        .split('|')
        .map((flag) => flag.trim())
        .forEach((flag) => {
            if (flag !== 'NONE') bitFlag.set(enumType[flag]);
        });
    return bitFlag;
};

export default class Item {
    #id;
    #name;
    #type;
    #subType;
    #size;
    #antiFlags;
    #flags;
    #wearFlags;
    #immuneFlags;
    #gold;
    #shopPrice;
    #refineId;
    #refineSet;
    #magicPercent;
    #limits = [];
    #applies = [];
    #values = [];
    #specular;
    #socket;
    #addon;
    #count;

    #dbId;
    #ownerId;
    #position;
    #window;
    #socket0;
    #socket1;
    #socket2;
    #attributeType0;
    #attributeValue0;
    #attributeType1;
    #attributeValue1;
    #attributeType2;
    #attributeValue2;
    #attributeType3;
    #attributeValue3;
    #attributeType4;
    #attributeValue4;
    #attributeType5;
    #attributeValue5;
    #attributeType6;
    #attributeValue6;

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
    }) {
        this.#id = id;
        this.#name = name;
        this.#type = type;
        this.#subType = subType;
        this.#size = size;
        this.#antiFlags = antiFlags;
        this.#flags = flags;
        this.#wearFlags = wearFlags;
        this.#immuneFlags = immuneFlags;
        this.#gold = gold;
        this.#shopPrice = shopPrice;
        this.#refineId = refineId;
        this.#refineSet = refineSet;
        this.#magicPercent = magicPercent;
        this.#limits = limits;
        this.#applies = applies;
        this.#values = values;
        this.#specular = specular;
        this.#socket = socket;
        this.#addon = addon;
        this.#count = count;
        this.#socket0 = socket0;
        this.#socket1 = socket1;
        this.#socket2 = socket2;
        this.#attributeType0 = attributeType0;
        this.#attributeValue0 = attributeValue0;
        this.#attributeType1 = attributeType1;
        this.#attributeValue1 = attributeValue1;
        this.#attributeType2 = attributeType2;
        this.#attributeValue2 = attributeValue2;
        this.#attributeType3 = attributeType3;
        this.#attributeValue3 = attributeValue3;
        this.#attributeType4 = attributeType4;
        this.#attributeValue4 = attributeValue4;
        this.#attributeType5 = attributeType5;
        this.#attributeValue5 = attributeValue5;
        this.#attributeType6 = attributeType6;
        this.#attributeValue6 = attributeValue6;
        this.#dbId = dbId;
    }

    get id() {
        return this.#id;
    }
    get name() {
        return this.#name;
    }
    get type() {
        return this.#type;
    }
    get subType() {
        return this.#subType;
    }
    get size() {
        return this.#size;
    }
    get antiFlags() {
        return this.#antiFlags;
    }
    get flags() {
        return this.#flags;
    }
    get wearFlags() {
        return this.#wearFlags;
    }
    get immuneFlags() {
        return this.#immuneFlags;
    }
    get gold() {
        return this.#gold;
    }
    get shopPrice() {
        return this.#shopPrice;
    }
    get refineId() {
        return this.#refineId;
    }
    get refineSet() {
        return this.#refineSet;
    }
    get magicPercent() {
        return this.#magicPercent;
    }
    get limits() {
        return this.#limits;
    }
    get applies() {
        return this.#applies;
    }
    get values() {
        return this.#values;
    }
    get specular() {
        return this.#specular;
    }
    get socket() {
        return this.#socket;
    }
    get addon() {
        return this.#addon;
    }
    get count() {
        return this.#count;
    }
    get ownerId() {
        return this.#ownerId;
    }
    set ownerId(value) {
        this.#ownerId = value;
    }
    get position() {
        return this.#position;
    }
    set position(value) {
        this.#position = value;
    }
    get dbId() {
        return this.#dbId;
    }
    get socket0() {
        return this.#socket0;
    }
    get socket1() {
        return this.#socket1;
    }
    get socket2() {
        return this.#socket2;
    }
    get attributeType0() {
        return this.#attributeType0;
    }
    get attributeValue0() {
        return this.#attributeValue0;
    }
    get attributeType1() {
        return this.#attributeType1;
    }
    get attributeValue1() {
        return this.#attributeValue1;
    }
    get attributeType2() {
        return this.#attributeType2;
    }
    get attributeValue2() {
        return this.#attributeValue2;
    }
    get attributeType3() {
        return this.#attributeType3;
    }
    get attributeValue3() {
        return this.#attributeValue3;
    }
    get attributeType4() {
        return this.#attributeType4;
    }
    get attributeValue4() {
        return this.#attributeValue4;
    }
    get attributeType5() {
        return this.#attributeType5;
    }
    get attributeValue5() {
        return this.#attributeValue5;
    }
    get attributeType6() {
        return this.#attributeType6;
    }
    get attributeValue6() {
        return this.#attributeValue6;
    }
    get window() {
        return this.#window;
    }
    set dbId(value) {
        this.#dbId = value;
    }
    set socket0(value) {
        this.#socket0 = value;
    }
    set socket1(value) {
        this.#socket1 = value;
    }
    set socket2(value) {
        this.#socket2 = value;
    }
    set attributeType0(value) {
        this.#attributeType0 = value;
    }
    set attributeValue0(value) {
        this.#attributeValue0 = value;
    }
    set attributeType1(value) {
        this.#attributeType1 = value;
    }
    set attributeValue1(value) {
        this.#attributeValue1 = value;
    }
    set attributeType2(value) {
        this.#attributeType2 = value;
    }
    set attributeValue2(value) {
        this.#attributeValue2 = value;
    }
    set attributeType3(value) {
        this.#attributeType3 = value;
    }
    set attributeValue3(value) {
        this.#attributeValue3 = value;
    }
    set attributeType4(value) {
        this.#attributeType4 = value;
    }
    set attributeValue4(value) {
        this.#attributeValue4 = value;
    }
    set attributeType5(value) {
        this.#attributeType5 = value;
    }
    set attributeValue5(value) {
        this.#attributeValue5 = value;
    }
    set attributeType6(value) {
        this.#attributeType6 = value;
    }
    set attributeValue6(value) {
        this.#attributeValue6 = value;
    }
    set window(value) {
        this.#window = value;
    }

    getLevelLimit() {
        return this.#limits.find((limit) => limit.type === ItemLimitTypeEnum.LEVEL)?.value ?? 0;
    }

    static create(proto, count) {
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
            id: this.#dbId,
            ownerId: this.#ownerId,
            window: this.#window,
            position: this.#position,
            count: this.#count,
            protoId: this.#id,
            socket0: this.#socket0,
            socket1: this.#socket1,
            socket2: this.#socket2,
            attributeType0: this.#attributeType0,
            attributeValue0: this.#attributeValue0,
            attributeType1: this.#attributeType1,
            attributeValue1: this.#attributeValue1,
            attributeType2: this.#attributeType2,
            attributeValue2: this.#attributeValue2,
            attributeType3: this.#attributeType3,
            attributeValue3: this.#attributeValue3,
            attributeType4: this.#attributeType4,
            attributeValue4: this.#attributeValue4,
            attributeType5: this.#attributeType5,
            attributeValue5: this.#attributeValue5,
            attributeType6: this.#attributeType6,
            attributeValue6: this.#attributeValue6,
        };
    }
}
