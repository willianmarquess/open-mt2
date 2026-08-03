import { expect } from 'chai';
import Item from '@/core/domain/entities/game/item/Item';
import { ItemLimitTypeEnum } from '@/core/enum/ItemLimitTypeEnum';

const baseProto = {
    vnum: '479',
    name: 'Dragon Tooth Blade +9',
    item_type: 'ITEM_WEAPON',
    sub_type: 'WEAPON_SWORD',
    size: '2',
    anti_flag: 'ANTI_MUSA | ANTI_ASSASSIN | ANTI_MUDANG | ANTI_SELL',
    flag: 'ITEM_TUNABLE',
    item_wear: 'WEAR_WEAPON',
    immune: 'NONE',
    gold: '120000',
    shop_buy_price: '515000',
    refine: '0',
    refineset: '0',
    magic_pct: '0',
    limit_type0: 'LEVEL',
    limit_value0: '105',
    limit_type1: 'LIMIT_NONE',
    limit_value1: '0',
    addon_type0: 'APPLY_ATT_SPEED',
    addon_value0: '15',
    addon_type1: 'APPLY_ATTBONUS_HUMAN',
    addon_value1: '15',
    addon_type2: 'APPLY_ATTBONUS_MONSTER',
    addon_value2: '5',
    value0: '0',
    value1: '149',
    value2: '211',
    value3: '116',
    value4: '164',
    value5: '250',
    specular: '100',
    socket: '3',
    attu_addon: '0',
};

describe('Item', () => {
    describe('create (proto parsing)', () => {
        it('should parse a bare LEVEL limit type (items.json does not prefix it)', () => {
            const item = Item.create(baseProto as any, 1);

            expect(item.getLevelLimit()).to.be.equal(105);
        });

        it('should parse the prefixed LIMIT_NONE limit type as no limit', () => {
            const item = Item.create({ ...baseProto, limit_type0: 'LIMIT_NONE', limit_value0: '0' } as any, 1);

            expect(item.getLevelLimit()).to.be.equal(0);
            expect(item.getLimits().every((limit) => limit.type === ItemLimitTypeEnum.NONE)).to.be.equal(true);
        });
    });
});
