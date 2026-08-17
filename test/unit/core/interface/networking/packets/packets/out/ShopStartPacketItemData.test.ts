import { expect } from 'chai';
import ShopStartPacket from '@/core/interface/networking/packets/packet/out/ShopStartPacket';
import Item from '@/core/domain/entities/game/item/Item';
import { ShopItem } from '@/core/domain/shop/ShopItem';

const HEADER_BYTES = 1 + 2 + 1 + 4;
const SOCKETS_OFFSET = HEADER_BYTES + 4 + 4 + 1 + 1;
const BONUSES_OFFSET = SOCKETS_OFFSET + 3 * 4;

// Same shape as the fixture in Item.test.ts: a real proto, so Item.create
// parses it the way it does in production.
const proto: any = {
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

/** A listing backed by a real, upgraded item, the way a private shop entry is. */
const createListedItem = () => {
    const item = Item.create(proto, 1);
    item.setSocket0(10);
    item.setSocket1(20);
    item.setSocket2(30);
    item.setAttributeType0(5);
    return item;
};

describe('ShopStartPacket item data', () => {
    it('should advertise the sockets of a listed item instead of zeroing them', () => {
        const items: ShopItem[] = [
            { vnum: 1000, count: 1, price: 500, item: createListedItem(), size: 1, position: 0 },
        ];

        const buffer = new ShopStartPacket({ ownerVid: 1, items }).pack();

        expect(buffer.readUInt32LE(SOCKETS_OFFSET)).to.equal(10);
        expect(buffer.readUInt32LE(SOCKETS_OFFSET + 4)).to.equal(20);
        expect(buffer.readUInt32LE(SOCKETS_OFFSET + 8)).to.equal(30);
    });

    it('should advertise the attributes of a listed item', () => {
        const items: ShopItem[] = [
            { vnum: 1000, count: 1, price: 500, item: createListedItem(), size: 1, position: 0 },
        ];

        const buffer = new ShopStartPacket({ ownerVid: 1, items }).pack();

        // Only the type is asserted: Item currently exposes setAttributeType0
        // but no matching setAttributeValue0 (the value setters are an
        // inconsistent set), so the value cannot be seeded from a spec.
        expect(buffer.readUInt8(BONUSES_OFFSET), 'attribute id').to.equal(5);
    });

    it('should still send zeros for an entry with no item behind it', () => {
        // An NPC shop entry is a bare proto, which the original also serialises
        // as zeros — the rule is "copy when there is an item", not "branch on
        // the kind of shop".
        const items: ShopItem[] = [{ vnum: 1000, count: 1, price: 500, item: undefined as any, size: 1, position: 0 }];

        const buffer = new ShopStartPacket({ ownerVid: 1, items }).pack();

        expect(buffer.readUInt32LE(SOCKETS_OFFSET)).to.equal(0);
        expect(buffer.readUInt8(BONUSES_OFFSET)).to.equal(0);
    });
});
