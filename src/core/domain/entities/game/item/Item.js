import ItemAntiFlagEnum from '../../../../enum/ItemAntiFlagEnum.js';
import ItemFlagEnum from '../../../../enum/ItemFlagEnum.js';
import ItemImmuneFlagEnum from '../../../../enum/ItemImmuneFlagEnum.js';
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

    static create(proto) {
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
                new ItemLimit({ type: proto.limit_type0, value: proto.limit_value0 }),
                new ItemLimit({ type: proto.limit_type1, value: proto.limit_value1 }),
            ],
            applies: [
                new ItemApply({ type: proto.addon_type0, value: proto.addon_value0 }),
                new ItemApply({ type: proto.addon_type1, value: proto.addon_value1 }),
                new ItemApply({ type: proto.addon_type2, value: proto.addon_value2 }),
            ],
            values: [
                Number(proto.value0),
                Number(proto.value1),
                Number(proto.value2),
                Number(proto.value3),
                Number(proto.value4),
                Number(proto.value5),
            ],
        });
    }
}
