import MyShopPacket, { ITEM_ENTRY_SIZE } from '@/core/interface/networking/packets/packet/in/myshop/MyShopPacket';
import { PRIVATE_SHOP_MAX_ITEMS } from '@/core/domain/shop/PrivateShop';
import { expect } from 'chai';

const FIXED_SIZE = 35;
const COUNT_OFFSET = FIXED_SIZE - 1;
const SEQUENCE_BYTE = 1;

const shopHeader = (count: number) => {
    const buffer = Buffer.alloc(FIXED_SIZE);
    buffer.writeUInt8(count, COUNT_OFFSET);
    return buffer;
};

describe('MyShopPacket', function () {
    let myShopPacket: MyShopPacket;

    beforeEach(function () {
        myShopPacket = new MyShopPacket();
    });

    it('should ask for more bytes while the fixed part is incomplete', function () {
        expect(myShopPacket.getFrameLength(Buffer.alloc(FIXED_SIZE - 1))).to.equal(null);
    });

    it('should frame a shop with no items', function () {
        expect(myShopPacket.getFrameLength(shopHeader(0))).to.equal(FIXED_SIZE + SEQUENCE_BYTE);
    });

    it('should frame a full shop', function () {
        expect(myShopPacket.getFrameLength(shopHeader(PRIVATE_SHOP_MAX_ITEMS))).to.equal(
            FIXED_SIZE + PRIVATE_SHOP_MAX_ITEMS * ITEM_ENTRY_SIZE + SEQUENCE_BYTE,
        );
    });

    // Framing must follow the bytes on the wire, not the item cap: a length
    // clamped to PRIVATE_SHOP_MAX_ITEMS leaves the declared surplus in the
    // buffer, where the drain loop reads it as further packets.
    it('should frame on the declared count even when it exceeds the item cap', function () {
        const declared = PRIVATE_SHOP_MAX_ITEMS * 2;

        expect(myShopPacket.getFrameLength(shopHeader(declared))).to.equal(
            FIXED_SIZE + declared * ITEM_ENTRY_SIZE + SEQUENCE_BYTE,
        );
    });

    it('should report a length above the server limit for an absurd count', function () {
        expect(myShopPacket.getFrameLength(shopHeader(255))).to.be.greaterThan(1024);
    });
});
