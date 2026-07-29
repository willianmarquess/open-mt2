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
    /** Price set by the seller (in gold). */
    price: number;
    /** Display slot in the shop window. */
    displayPos: number;
};

const SIGN_FIELD_LEN = PRIVATE_SHOP_SIGN_MAX_LEN + 1; // 33
const ITEM_ENTRY_SIZE = 13;
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

    getFrameLength(buffer: Buffer): number | null {
        if (buffer.byteLength < FIXED_SIZE) return null;
        const count = Math.min(buffer.readUInt8(FIXED_SIZE - 1), PRIVATE_SHOP_MAX_ITEMS);
        return FIXED_SIZE + count * ITEM_ENTRY_SIZE + this.getSequenceLength();
    }

    unpack(buffer: Buffer): this {
        this.bufferReader.setBuffer(buffer);

        this.sign = this.bufferReader.readString(SIGN_FIELD_LEN);
        this.count = Math.min(this.bufferReader.readUInt8(), PRIVATE_SHOP_MAX_ITEMS);

        // The declared count must match the bytes actually sent — a malformed
        // packet lying about its count would make the reads below run past the
        // end of the buffer.
        if (buffer.byteLength < FIXED_SIZE + this.count * ITEM_ENTRY_SIZE) {
            throw new Error(
                `MyShopPacket: buffer too short for declared item count (count: ${this.count}, bytes: ${buffer.byteLength})`,
            );
        }

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
