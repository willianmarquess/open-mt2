import { expect } from 'chai';
import ShopPacket from '@/core/interface/networking/packets/packet/in/shop/ShopPacket';
import { ShopSubHeaderCG } from '@/core/enum/ShopSubHeaderEnum';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';

// BufferReader skips byte 0 (header) by default.
// So the test buffer layout is:
//   [0] = header (skipped)
//   [1] = shopSubHeader
//   [2] = ...args...

describe('ShopPacket', () => {
    let packet: ShopPacket;

    beforeEach(() => {
        packet = new ShopPacket();
    });

    it('should initialize with correct header and name', () => {
        expect(packet.getHeader()).to.equal(PacketHeaderEnum.SHOP_IN);
        expect(packet.getName()).to.equal('ShopPacket');
    });

    it('should unpack BUY command correctly', () => {
        const buffer = Buffer.alloc(4);
        buffer.writeUInt8(PacketHeaderEnum.SHOP_IN, 0); // header (skipped by BufferReader)
        buffer.writeUInt8(ShopSubHeaderCG.BUY, 1); // subheader
        buffer.writeUInt8(0, 2); // unused padding
        buffer.writeUInt8(5, 3); // pos

        packet.unpack(buffer);

        expect(packet.getShopSubHeader()).to.equal(ShopSubHeaderCG.BUY);
        expect(packet.getPos()).to.equal(5);
    });

    it('should unpack SELL command correctly', () => {
        const buffer = Buffer.alloc(3);
        buffer.writeUInt8(PacketHeaderEnum.SHOP_IN, 0); // header (skipped)
        buffer.writeUInt8(ShopSubHeaderCG.SELL, 1); // subheader
        buffer.writeUInt8(10, 2); // pos

        packet.unpack(buffer);

        expect(packet.getShopSubHeader()).to.equal(ShopSubHeaderCG.SELL);
        expect(packet.getPos()).to.equal(10);
    });

    it('should unpack SELL2 command correctly', () => {
        const buffer = Buffer.alloc(4);
        buffer.writeUInt8(PacketHeaderEnum.SHOP_IN, 0); // header (skipped)
        buffer.writeUInt8(ShopSubHeaderCG.SELL2, 1); // subheader
        buffer.writeUInt8(15, 2); // pos
        buffer.writeUInt8(3, 3); // count

        packet.unpack(buffer);

        expect(packet.getShopSubHeader()).to.equal(ShopSubHeaderCG.SELL2);
        expect(packet.getPos()).to.equal(15);
        expect(packet.getCount()).to.equal(3);
    });

    it('should unpack END command correctly', () => {
        const buffer = Buffer.alloc(2); // header + subheader
        buffer.writeUInt8(PacketHeaderEnum.SHOP_IN, 0); // header (skipped)
        buffer.writeUInt8(ShopSubHeaderCG.END, 1); // subheader

        packet.unpack(buffer);

        expect(packet.getShopSubHeader()).to.equal(ShopSubHeaderCG.END);
    });

    it('should default pos to 0 for END command', () => {
        const buffer = Buffer.alloc(2);
        buffer.writeUInt8(PacketHeaderEnum.SHOP_IN, 0);
        buffer.writeUInt8(ShopSubHeaderCG.END, 1);

        packet.unpack(buffer);

        expect(packet.getPos()).to.equal(0);
        expect(packet.getCount()).to.equal(0);
    });
});
