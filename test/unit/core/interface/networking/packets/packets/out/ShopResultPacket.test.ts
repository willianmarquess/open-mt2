import { expect } from 'chai';
import ShopEndPacket from '@/core/interface/networking/packets/packet/out/ShopEndPacket';
import ShopResultPacket from '@/core/interface/networking/packets/packet/out/ShopResultPacket';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import { ShopSubHeaderGC } from '@/core/enum/ShopSubHeaderEnum';

describe('ShopEndPacket', () => {
    let packet: ShopEndPacket;

    beforeEach(() => {
        packet = new ShopEndPacket();
    });

    it('should initialize with correct header', () => {
        expect(packet.getHeader()).to.equal(PacketHeaderEnum.SHOP_OUT);
        expect(packet.getName()).to.equal('ShopEndPacket');
    });

    it('should pack correct size', () => {
        const buffer = packet.pack();
        const size = buffer.readUInt16LE(1);
        expect(size).to.equal(4); // header + size + subheader
    });

    it('should pack correct subheader (END)', () => {
        const buffer = packet.pack();
        expect(buffer.readUInt8(3)).to.equal(ShopSubHeaderGC.END);
    });

    it('should pack to 4 bytes', () => {
        const buffer = packet.pack();
        expect(buffer.length).to.equal(4);
    });
});

describe('ShopResultPacket', () => {
    it('should initialize with correct header', () => {
        const packet = new ShopResultPacket({ result: ShopSubHeaderGC.OK });
        expect(packet.getHeader()).to.equal(PacketHeaderEnum.SHOP_OUT);
    });

    it('should pack OK result', () => {
        const packet = new ShopResultPacket({ result: ShopSubHeaderGC.OK });
        const buffer = packet.pack();

        expect(buffer.readUInt8(3)).to.equal(ShopSubHeaderGC.OK);
    });

    it('should pack NOT_ENOUGH_MONEY result', () => {
        const packet = new ShopResultPacket({ result: ShopSubHeaderGC.NOT_ENOUGH_MONEY });
        const buffer = packet.pack();

        expect(buffer.readUInt8(3)).to.equal(ShopSubHeaderGC.NOT_ENOUGH_MONEY);
    });

    it('should pack SOLD_OUT result', () => {
        const packet = new ShopResultPacket({ result: ShopSubHeaderGC.SOLD_OUT });
        const buffer = packet.pack();

        expect(buffer.readUInt8(3)).to.equal(ShopSubHeaderGC.SOLD_OUT);
    });

    it('should pack INVENTORY_FULL result', () => {
        const packet = new ShopResultPacket({ result: ShopSubHeaderGC.INVENTORY_FULL });
        const buffer = packet.pack();

        expect(buffer.readUInt8(3)).to.equal(ShopSubHeaderGC.INVENTORY_FULL);
    });

    it('should pack correct packet size', () => {
        const packet = new ShopResultPacket({ result: ShopSubHeaderGC.OK });
        const buffer = packet.pack();
        const size = buffer.readUInt16LE(1);
        expect(size).to.equal(4); // header + size + subheader(=result)
    });

    it('should pack to 4 bytes', () => {
        const packet = new ShopResultPacket({ result: ShopSubHeaderGC.OK });
        const buffer = packet.pack();
        expect(buffer.length).to.equal(4);
    });
});
