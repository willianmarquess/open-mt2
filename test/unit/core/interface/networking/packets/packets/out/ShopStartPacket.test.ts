import { expect } from 'chai';
import ShopStartPacket from '@/core/interface/networking/packets/packet/out/ShopStartPacket';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import { ShopSubHeaderGC } from '@/core/enum/ShopSubHeaderEnum';
import { ShopItem } from '@/core/domain/shop/ShopItem';

describe('ShopStartPacket', () => {
    let packet: ShopStartPacket;

    beforeEach(() => {
        const items: ShopItem[] = [
            { vnum: 1000, count: 1, price: 500, item: { getSize: () => 1 } as any, size: 1, position: 0 },
            { vnum: 1010, count: 1, price: 1000, item: { getSize: () => 1 } as any, size: 1, position: 1 },
        ];
        packet = new ShopStartPacket({ ownerVid: 12345, items });
    });

    it('should initialize with correct header', () => {
        expect(packet.getHeader()).to.equal(PacketHeaderEnum.SHOP_OUT);
        expect(packet.getName()).to.equal('ShopStartPacket');
    });

    it('should pack packet with correct size (1728 bytes)', () => {
        const buffer = packet.pack();
        expect(buffer.length).to.equal(1728);
    });

    it('should pack header correctly', () => {
        const buffer = packet.pack();
        expect(buffer.readUInt8(0)).to.equal(PacketHeaderEnum.SHOP_OUT);
    });

    it('should pack packet size correctly', () => {
        const buffer = packet.pack();
        const size = buffer.readUInt16LE(1);
        expect(size).to.equal(1728);
    });

    it('should pack subheader correctly', () => {
        const buffer = packet.pack();
        expect(buffer.readUInt8(3)).to.equal(ShopSubHeaderGC.START);
    });

    it('should pack owner vid correctly', () => {
        const buffer = packet.pack();
        const ownerVid = buffer.readUInt32LE(4);
        expect(ownerVid).to.equal(12345);
    });

    it('should pack first item correctly', () => {
        const buffer = packet.pack();
        // Item 0 starts at offset: 1(header) + 2(size) + 1(subheader) + 4(ownerVid) = 8
        const itemOffset = 8;

        const vnum = buffer.readUInt32LE(itemOffset);
        const price = buffer.readUInt32LE(itemOffset + 4);
        const count = buffer.readUInt8(itemOffset + 8);
        const displayPos = buffer.readUInt8(itemOffset + 9);

        expect(vnum).to.equal(1000);
        expect(price).to.equal(500);
        expect(count).to.equal(1);
        expect(displayPos).to.equal(0);
    });

    it('should pack second item correctly', () => {
        const buffer = packet.pack();
        // Item 1 starts at: 8 + 43 = 51
        const itemOffset = 8 + 43;

        const vnum = buffer.readUInt32LE(itemOffset);
        const price = buffer.readUInt32LE(itemOffset + 4);
        const count = buffer.readUInt8(itemOffset + 8);
        const displayPos = buffer.readUInt8(itemOffset + 9);

        expect(vnum).to.equal(1010);
        expect(price).to.equal(1000);
        expect(count).to.equal(1);
        expect(displayPos).to.equal(1);
    });

    it('should pack empty slots as zeros', () => {
        const buffer = packet.pack();
        // Item 3 (first empty slot) starts at: 8 + 43*3 = 137
        const itemOffset = 8 + 43 * 3;

        const vnum = buffer.readUInt32LE(itemOffset);
        const price = buffer.readUInt32LE(itemOffset + 4);
        const count = buffer.readUInt8(itemOffset + 8);

        expect(vnum).to.equal(0);
        expect(price).to.equal(0);
        expect(count).to.equal(0);
    });

    it('should pack all 40 items slots', () => {
        const buffer = packet.pack();
        expect(buffer.length).to.equal(1728);

        // Verify we have exactly 40 slots
        // Total size = header(1) + size(2) + subheader(1) + ownerVid(4) + 40*43 = 1728
        const headerSize = 1 + 2 + 1 + 4;
        const itemsAreaSize = buffer.length - headerSize;
        expect(itemsAreaSize).to.equal(40 * 43);
    });

    it('should pack sockets as zeros', () => {
        const buffer = packet.pack();
        // Item 0, sockets start at: 8 + 10 (vnum+price+count+pos) = 18
        const socketsOffset = 8 + 10;

        for (let i = 0; i < 3; i++) {
            const socket = buffer.readUInt32LE(socketsOffset + i * 4);
            expect(socket).to.equal(0);
        }
    });

    it('should pack bonuses as zeros', () => {
        const buffer = packet.pack();
        // Item 0, bonuses start at: 8 + 10 + 12 (sockets) = 30
        const bonusesOffset = 8 + 10 + 12;

        for (let i = 0; i < 7; i++) {
            const bonusId = buffer.readUInt8(bonusesOffset + i * 3);
            const bonusValue = buffer.readUInt16LE(bonusesOffset + i * 3 + 1);
            expect(bonusId).to.equal(0);
            expect(bonusValue).to.equal(0);
        }
    });

    it('should handle empty items array', () => {
        const emptyPacket = new ShopStartPacket({ ownerVid: 99999, items: [] });
        const buffer = emptyPacket.pack();

        expect(buffer.length).to.equal(1728);
        // All items should be zero
        const headerSize = 1 + 2 + 1 + 4;
        const firstItemVnum = buffer.readUInt32LE(headerSize);
        expect(firstItemVnum).to.equal(0);
    });
});
