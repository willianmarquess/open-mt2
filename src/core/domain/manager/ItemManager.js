import ItemAntiFlagEnum from '../../enum/ItemAntiFlagEnum.js';
import ItemFlagEnum from '../../enum/ItemFlagEnum.js';
import ItemImmuneFlagEnum from '../../enum/ItemImmuneFlagEnum.js';
import ItemWearFlagEnum from '../../enum/ItemWearFlagEnum.js';
import Item from '../entities/game/item/Item.js';
import ItemApply from '../entities/game/item/ItemApply.js';
import ItemLimit from '../entities/game/item/ItemLimit.js';

export default class ItemManager {
    #config;
    #items = new Map();

    constructor({ config }) {
        this.#config = config;
    }

    load() {
        this.#config.items.forEach((item) => {
            this.#items.set(item.vnum, item);
        });
    }

    hasItem(id) {
        return this.#items.has(id);
    }

    getItem(id) {
        if (!this.hasItem(id)) {
            return;
        }

        const proto = this.#items.get(id);

        const antiFlags = proto.anti_flag.split('|').map((antiFlag) => antiFlag.trim());
        const flags = proto.flag.split('|').map((flag) => flag.trim());
        const immuneFlags = proto.immune.split('|').map((immune) => immune.trim());
        const wearFlags = proto.item_wear.split('|').map((wearFlag) => wearFlag.trim());

        return new Item({
            id: proto.vnum,
            name: proto.name,
            type: proto.item_type,
            gold: proto.gold,
            shopPrice: proto.shop_buy_price,
            refineId: proto.refine,
            refineSet: proto.refineset,
            magicPercent: proto.magic_pct,
            subType: proto.sub_type,
            size: proto.size,
            addon: proto.attu_addon,
            socket: proto.socket,
            specular: proto.specular,
            antiFlags: antiFlags.map((antiFlag) => ItemAntiFlagEnum[antiFlag] || ItemAntiFlagEnum.NONE),
            flags: flags.map((flag) => ItemFlagEnum[flag] || ItemFlagEnum.NONE),
            immuneFlags: immuneFlags.map((immuneFlag) => ItemImmuneFlagEnum[immuneFlag] || ItemImmuneFlagEnum.NONE),
            wearFlags: wearFlags.map((wearFlag) => ItemWearFlagEnum[wearFlag] || ItemWearFlagEnum.NONE),
            limits: [
                new ItemLimit({ type: proto.limit_type0, value: proto.limit_value0 }),
                new ItemLimit({ type: proto.limit_type1, value: proto.limit_value1 }),
            ],
            applies: [
                new ItemApply({ type: proto.addon_type0, value: proto.addon_value0 }),
                new ItemApply({ type: proto.addon_type1, value: proto.addon_value1 }),
                new ItemApply({ type: proto.addon_type2, value: proto.addon_value2 }),
            ],
            values: [proto.value0, proto.value1, proto.value2, proto.value3, proto.value4, proto.value5],
        });
    }
}
