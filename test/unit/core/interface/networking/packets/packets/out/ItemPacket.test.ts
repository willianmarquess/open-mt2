import { expect } from 'chai';
import ItemPacket from '@/core/interface/networking/packets/packet/out/ItemPacket';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';

/**
 * The wire layout is TPacketGCItemSet2 (client Packet.h, #pragma pack(1)):
 * header 1 + Cell(BYTE+WORD) 3 + vnum 4 + count 1 + flags 4 + anti_flags 4 +
 * highlight 1 (bool) + alSockets[3] 12 + aAttr[7] 21 = 51 bytes.
 * The offsets asserted below are the client struct's offsets; reading the
 * sockets and attributes back from those exact positions is what pins the
 * 1-byte highlight — a wider highlight shifts everything after it.
 */
describe('ItemPacket', () => {
    const packet = () =>
        new ItemPacket({
            window: 1,
            position: 7,
            id: 50431,
            count: 3,
            flags: 0,
            antiFlags: 0,
            highlight: 0,
            sockets: [111, 222, 333],
            bonuses: [
                { id: 5, value: 1500 },
                { id: 6, value: 20 },
            ],
        });

    it('initializes with the ITEM header', () => {
        expect(packet().getHeader()).to.equal(PacketHeaderEnum.ITEM);
        expect(packet().getName()).to.equal('ItemPacket');
    });

    it('packs to the client struct size of 51 bytes', () => {
        expect(packet().pack()).to.have.lengthOf(51);
    });

    it('packs the fields up to highlight at the client struct offsets', () => {
        const buffer = packet().pack();

        expect(buffer.readUInt8(0), 'header').to.equal(PacketHeaderEnum.ITEM);
        expect(buffer.readUInt8(1), 'window').to.equal(1);
        expect(buffer.readUInt16LE(2), 'position').to.equal(7);
        expect(buffer.readUInt32LE(4), 'vnum').to.equal(50431);
        expect(buffer.readUInt8(8), 'count').to.equal(3);
        expect(buffer.readUInt32LE(9), 'flags').to.equal(0);
        expect(buffer.readUInt32LE(13), 'antiFlags').to.equal(0);
        expect(buffer.readUInt8(17), 'highlight').to.equal(0);
    });

    it('packs the sockets right after the 1-byte highlight, where the client reads alSockets', () => {
        const buffer = packet().pack();

        expect(buffer.readUInt32LE(18), 'socket 0').to.equal(111);
        expect(buffer.readUInt32LE(22), 'socket 1').to.equal(222);
        expect(buffer.readUInt32LE(26), 'socket 2').to.equal(333);
    });

    it('packs the attributes where the client reads aAttr', () => {
        const buffer = packet().pack();

        expect(buffer.readUInt8(30), 'attr 0 type').to.equal(5);
        expect(buffer.readUInt16LE(31), 'attr 0 value').to.equal(1500);
        expect(buffer.readUInt8(33), 'attr 1 type').to.equal(6);
        expect(buffer.readUInt16LE(34), 'attr 1 value').to.equal(20);
    });

    it('leaves omitted sockets and attributes as zeroes up to the last byte', () => {
        const buffer = new ItemPacket({
            window: 1,
            position: 0,
            id: 0,
            count: 0,
            flags: 0,
            antiFlags: 0,
            highlight: 0,
        }).pack();

        expect(buffer).to.have.lengthOf(51);
        expect(
            buffer.subarray(18).every((byte) => byte === 0),
            'sockets and attrs are zero-filled',
        ).to.equal(true);
    });
});
