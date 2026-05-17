import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketIn from '../PacketIn';
import MyShopPacketValidator from './MyShopPacketValidator';
import { PRIVATE_SHOP_MAX_ITEMS, PRIVATE_SHOP_SIGN_MAX_LEN } from '@/core/domain/shop/PrivateShop';

export type MyShopItemEntry = {
    /** Item vnum (proto ID). */
    vnum: number;
    /** Stack count. */
    count: number;
    /** Window type (always INVENTORY = 2 for private shops). */
    windowType: number;
    /** Inventory cell index. */
    cellIndex: number;
    /** Price set by the seller (in yang). */
    price: number;
    /** Display slot in the shop window. */
    displayPos: number;
};

// CG_MYSHOP wire layout (variable-length):
//  [1B  header=0x37]
//  [33B szSign        - null-terminated, SHOP_SIGN_MAX_LEN+1 bytes]
//  [1B  bCount        - 0 means close shop]
//  bCount × TShopItemTable {
//    [4B  vnum        LE]
//    [1B  count           ]
//    [1B  window_type     ]  \__ TItemPos
//    [2B  cell        LE]  /
//    [4B  price       LE]
//    [1B  display_pos     ]
//  }  (13 bytes per item)
//
// Minimum: 1 + 33 + 1 = 35 bytes
// Maximum: 35 + 40 × 13 = 555 bytes

const SIGN_FIELD_LEN = PRIVATE_SHOP_SIGN_MAX_LEN + 1; // 33
const ITEM_ENTRY_SIZE = 4 + 1 + 1 + 2 + 4 + 1; // 13
const FIXED_SIZE = 1 + SIGN_FIELD_LEN + 1; // 35

export { ITEM_ENTRY_SIZE };

export default class MyShopPacket extends PacketIn {
    private sign: string = '';
    private count: number = 0;
    private items: MyShopItemEntry[] = [];

    constructor() {
        super({
            header: PacketHeaderEnum.PLAYER_SHOP_IN,
            name: 'MyShopPacket',
            size: FIXED_SIZE, // minimum size; variable body follows
            validator: MyShopPacketValidator,
        });
    }

    getSign(): string {
        return this.sign;
    }

    getCount(): number {
        return this.count;
    }

    getItems(): MyShopItemEntry[] {
        return this.items;
    }

    unpack(buffer: Buffer): this {
        this.bufferReader.setBuffer(buffer);

        this.sign = this.bufferReader.readString(SIGN_FIELD_LEN);
        this.count = Math.min(this.bufferReader.readUInt8(), PRIVATE_SHOP_MAX_ITEMS);

        this.items = [];
        for (let i = 0; i < this.count; i++) {
            const vnum = this.bufferReader.readUInt32LE();
            const count = this.bufferReader.readUInt8();
            const windowType = this.bufferReader.readUInt8();
            const cellIndex = this.bufferReader.readUInt16LE();
            const price = this.bufferReader.readUInt32LE();
            const displayPos = this.bufferReader.readUInt8();
            this.items.push({ vnum, count, windowType, cellIndex, price, displayPos });
        }

        this.validate();
        return this;
    }
}
